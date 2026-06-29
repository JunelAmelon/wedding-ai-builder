import { NextResponse } from "next/server";
import { sessionRepo, getStoreBackend } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";

export async function POST() {
  try {
    const session = await sessionRepo.create();
    await eventRepo.log(session.id, "quiz_started", {});
    trackServer(session.id, "quiz_started", {});

    const res = NextResponse.json({ sessionId: session.id, backend: getStoreBackend() });
    res.headers.set("x-store-backend", getStoreBackend());
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
