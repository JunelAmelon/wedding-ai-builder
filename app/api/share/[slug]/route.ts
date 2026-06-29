import { NextResponse } from "next/server";
import { shareRepo } from "@/lib/db/repositories/shareRepo";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const record = await shareRepo.get(params.slug);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await shareRepo.incrementView(params.slug);

  return NextResponse.json({ riskScore: record.riskScore, sessionId: record.sessionId });
}
