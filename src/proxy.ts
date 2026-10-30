import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { parseArticleNumber } from "@/lib/articles/article-param";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/token";
import { getDb } from "@/lib/db";
import { articles, subjects, tags } from "@/lib/db/schema";
import { legacyTagRedirect, legacyTagTarget, type LegacyTagTarget } from "@/lib/taxonomy/legacy-tag";
import { TAXONOMY_MAPPING } from "@/lib/taxonomy/mapping";

// Malformed percent-encoding (e.g. "%" or a truncated escape) makes
// decodeURIComponent throw. Treat that as "not a slug we can resolve" and
// fall back to /articles instead of 500ing the proxy.
function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

// Legacy transliterated slugs get a real 308 here: the article page's own
// permanentRedirect streams as a 200 (PPR shell) so it cannot carry the
// status code. Numeric params pass through without a database query.
//
// Any raw segment containing "%" that we can't resolve to a published
// article is redirected to /articles rather than passed through with
// NextResponse.next(): the App Router's own dynamic-segment matcher for
// /articles/[slug] independently re-decodes the raw pathname downstream of
// the proxy and throws a DecodeError (server 500) on percent-encoded input
// it can't decode cleanly a second time, even when it's well-formed on its
// own (e.g. "%25"). Ending the request here with a redirect avoids handing
// that pathname to the page router at all. Plain-ASCII unknown slugs are
// unaffected and keep streaming the normal not-found page.
async function redirectLegacyArticle(request: NextRequest) {
  const rawSegment = request.nextUrl.pathname.slice("/articles/".length);
  const hasPercentEncoding = rawSegment.includes("%");
  const param = safeDecodeURIComponent(rawSegment);
  if (param === null) {
    return NextResponse.redirect(new URL("/articles", request.url));
  }
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
    if (hasPercentEncoding) {
      return NextResponse.redirect(new URL("/articles", request.url));
    }
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL(`/articles/${number}`, request.url), 308);
}

// The archive's old tag filter (/articles?tag=<name>) now lives on subject
// pages. A real redirect here, for the same streaming reason as legacy slugs.
// The backfill mapping knows what each original tag became; the database says
// whether that subject still exists, or where the admin has filed the tag.
async function liveSubjectSlug(target: LegacyTagTarget): Promise<string | null> {
  if (target.kind === "subject") {
    const rows = await getDb().select({ slug: subjects.slug }).from(subjects).where(eq(subjects.slug, target.slug)).limit(1);
    return rows[0]?.slug ?? null;
  }
  if (target.kind === "tag") {
    const rows = await getDb()
      .select({ slug: subjects.slug })
      .from(tags)
      .innerJoin(subjects, eq(subjects.id, tags.subjectId))
      .where(eq(tags.name, target.name))
      .limit(1);
    return rows[0]?.slug ?? null;
  }
  return null;
}

async function redirectLegacyTag(request: NextRequest, name: string) {
  const target = legacyTagTarget(name, TAXONOMY_MAPPING);
  let liveSlug: string | null;
  try {
    liveSlug = await liveSubjectSlug(target);
  } catch (error) {
    // A database hiccup should not turn an old link into a 500.
    console.error("legacy tag redirect lookup failed", error);
    return NextResponse.redirect(new URL("/articles", request.url), 307);
  }
  const { path, permanent } = legacyTagRedirect(target, liveSlug);
  return NextResponse.redirect(new URL(path, request.url), permanent ? 308 : 307);
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
  if (request.nextUrl.pathname === "/articles") {
    const tag = request.nextUrl.searchParams.get("tag");
    return tag ? redirectLegacyTag(request, tag) : NextResponse.next();
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
  matcher: ["/admin/:path*", "/articles", "/articles/:slug"],
};
