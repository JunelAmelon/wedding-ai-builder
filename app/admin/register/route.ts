import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL("/admin-register", req.url);
  const original = new URL(req.url);
  url.search = original.search;
  return NextResponse.redirect(url, 307);
}
