import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL("/admin-login", req.url);
  return NextResponse.redirect(url, 307);
}
