import { NextResponse } from "next/server";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
  try {
    const session = await sessionRepo.get(params.sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    const cookie = req.headers.get("cookie") || "";
    const hasCookie = cookie.includes(`wab_lead_${params.sessionId}=1`);

    if (!session.leadId && !hasCookie) {
      return NextResponse.json({ error: "Lead requis avant accès au résultat" }, { status: 403 });
    }

    await eventRepo.log(session.id, "result_viewed", { riskScore: session.aiOutput?.riskScore });
    trackServer(session.id, "result_viewed", { riskScore: session.aiOutput?.riskScore });

    return NextResponse.json({ session });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
