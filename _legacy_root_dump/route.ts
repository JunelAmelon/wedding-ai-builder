import { NextResponse } from "next/server";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";

export async function POST() {
  const session = await sessionRepo.create();
  await eventRepo.log(session.id, "quiz_started", {});
  trackServer(session.id, "quiz_started", {});

  return NextResponse.json({ sessionId: session.id });
}
