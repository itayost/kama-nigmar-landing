import { and, eq, sql } from "drizzle-orm";
import { slugSchema } from "@/lib/articles/blocks";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/db/schema";

// Public view-count beacon. Deliberately does NOT invalidate any cache:
// view counts are a ranking signal read by getRelatedArticles, which
// refreshes on its own cacheLife("hours") schedule.
export async function POST(request: Request): Promise<Response> {
  let slug: string;
  try {
    const body: unknown = await request.json();
    const parsed = slugSchema.safeParse(
      typeof body === "object" && body !== null && "slug" in body
        ? (body as { slug: unknown }).slug
        : undefined,
    );
    if (!parsed.success) {
      return new Response(null, { status: 400 });
    }
    slug = parsed.data;
  } catch {
    return new Response(null, { status: 400 });
  }

  await getDb()
    .update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")));

  return new Response(null, { status: 204 });
}
