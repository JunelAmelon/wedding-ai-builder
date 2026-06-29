import { NextResponse } from "next/server";
import { z } from "zod";
import { shareRepo } from "@/lib/db/repositories/shareRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";

const ShareSchema = z.object({
  sessionId: z.string().min(1),
  channel: z.string().default("link"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ShareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const { sessionId, channel } = parsed.data;

    const session = await sessionRepo.get(sessionId);
    if (!session || !session.aiOutput) {
      return NextResponse.json({ error: "Aucun résultat à partager pour cette session" }, { status: 404 });
    }

    const record = await shareRepo.create(sessionId, session.aiOutput.riskScore);

    await eventRepo.log(sessionId, "shared_score", { riskScore: record.riskScore, channel });
    trackServer(sessionId, "shared_score", { riskScore: record.riskScore, channel });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.json({ slug: record.slug, url: `${appUrl}/share/${record.slug}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
