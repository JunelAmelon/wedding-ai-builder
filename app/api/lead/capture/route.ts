import { NextResponse } from "next/server";
import { z } from "zod";
import { leadRepo } from "@/lib/db/repositories/leadRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";
import { sendResultEmail } from "@/lib/email/resend";

const LeadSchema = z.object({
  sessionId: z.string().min(1),
  email: z.string().email(),
  whatsapp: z.string().min(6).optional().nullable(),
  consentMarketing: z.boolean().default(true),
  source: z.enum(["gate", "share_page"]).default("gate"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide", details: parsed.error.flatten() }, { status: 400 });
    }

    const { sessionId, email, whatsapp, consentMarketing, source } = parsed.data;

    const session = await sessionRepo.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    const lead = await leadRepo.create({
      sessionId,
      email,
      whatsapp: whatsapp ?? null,
      source,
      consentMarketing,
    });
    await sessionRepo.linkLead(sessionId, lead.id);

    await eventRepo.log(sessionId, "email_captured", { source });
    trackServer(sessionId, "email_captured", { source });

    if (whatsapp) {
      await eventRepo.log(sessionId, "whatsapp_submitted", {});
      trackServer(sessionId, "whatsapp_submitted", {});
    }

    await sendResultEmail(email, sessionId);

    const res = NextResponse.json({ ok: true, leadId: lead.id });
    res.cookies.set({
      name: `wab_lead_${sessionId}`,
      value: "1",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
