import { NextResponse } from "next/server";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";

export async function GET(_req: Request, { params }: { params: { sessionId: string } }) {
  const session = await sessionRepo.get(params.sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  if (!session.leadId) {
    return NextResponse.json({ error: "Lead requis avant accès au résultat" }, { status: 403 });
  }

  await eventRepo.log(session.id, "result_viewed", { riskScore: session.aiOutput?.riskScore });
  trackServer(session.id, "result_viewed", { riskScore: session.aiOutput?.riskScore });

  return NextResponse.json({ session });
}
