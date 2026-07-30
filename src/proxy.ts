import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/token";

// Signature check only: full authorization still happens in requireAdmin()
// inside every admin page and Server Action. Verifying (rather than just
// checking cookie presence) prevents a redirect loop between /admin and
// /admin/login when a stale or invalid cookie is present, e.g. after an
// AUTH_SECRET rotation.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasValidSession = token !== undefined && (await verifySessionToken(token));
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!hasValidSession && !isLoginPage) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    if (token !== undefined) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }
  if (hasValidSession && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
