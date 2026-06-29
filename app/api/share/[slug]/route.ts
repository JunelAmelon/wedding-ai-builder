import { NextResponse } from "next/server";
import { shareRepo } from "@/lib/db/repositories/shareRepo";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const record = await shareRepo.get(params.slug);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await shareRepo.incrementView(params.slug);

    return NextResponse.json({ riskScore: record.riskScore, sessionId: record.sessionId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
