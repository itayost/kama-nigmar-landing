import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { parseArticleNumber } from "@/lib/articles/article-param";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/token";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/db/schema";

// Legacy transliterated slugs get a real 308 here: the article page's own
// permanentRedirect streams as a 200 (PPR shell) so it cannot carry the
// status code. Numeric params pass through without a database query.
async function redirectLegacyArticle(request: NextRequest) {
  const param = decodeURIComponent(
    request.nextUrl.pathname.slice("/articles/".length),
  );
  if (parseArticleNumber(param) !== null) {
    return NextResponse.next();
  }
  const rows = await getDb()
    .select({ number: articles.number })
    .from(articles)
    .where(and(eq(articles.slug, param), eq(articles.status, "published")))
    .limit(1);
  const number = rows[0]?.number;
  if (number === undefined) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL(`/articles/${number}`, request.url), 308);
}

// Signature check only: full authorization still happens in requireAdmin()
// inside every admin page and Server Action. Verifying (rather than just
// checking cookie presence) prevents a redirect loop between /admin and
// /admin/login when a stale or invalid cookie is present, e.g. after an
// AUTH_SECRET rotation.
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/articles/")) {
    return redirectLegacyArticle(request);
  }

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
  matcher: ["/admin/:path*", "/articles/:slug"],
};
