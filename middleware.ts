import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/result/")) {
    return NextResponse.next();
  }

  const sessionId = pathname.split("/")[2];
  if (!sessionId) {
    return NextResponse.next();
  }

  const cookieName = `wab_lead_${sessionId}`;
  const hasCookie = req.cookies.get(cookieName)?.value === "1";

  if (hasCookie) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/gate";
  url.searchParams.set("sessionId", sessionId);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/result/:path*"],
};
