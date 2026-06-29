import { NextResponse } from "next/server";
import { getStoreBackend } from "@/lib/db/repositories/sessionRepo";

export async function GET() {
  const backend = getStoreBackend();
  const res = NextResponse.json({ backend });
  res.headers.set("x-store-backend", backend);
  return res;
}
