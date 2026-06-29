import { NextResponse } from "next/server";
import { z } from "zod";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";
import { leadRepo } from "@/lib/db/repositories/leadRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";

const CtaSchema = z.object({
  sessionId: z.string().min(1),
  ctaLabel: z.enum(["pdf", "planner", "providers"]),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CtaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  const { sessionId, ctaLabel } = parsed.data;

  await eventRepo.log(sessionId, "cta_clicked", { ctaLabel });
  trackServer(sessionId, "cta_clicked", { ctaLabel });

  const session = await sessionRepo.get(sessionId);
  if (session?.leadId) {
    await leadRepo.addCtaClick(session.leadId, ctaLabel);
  }

  return NextResponse.json({ ok: true });
}
