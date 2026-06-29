import { NextResponse } from "next/server";
import { leadRepo } from "@/lib/db/repositories/leadRepo";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";

function checkPassword(req: Request): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${password}`;
}

export async function GET(req: Request) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const [leads, vendorApplications] = await Promise.all([leadRepo.list(), vendorRepo.list()]);
    return NextResponse.json({ leads, vendorApplications });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
