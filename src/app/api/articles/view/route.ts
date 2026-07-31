import { and, eq, sql } from "drizzle-orm";
import { slugSchema } from "@/lib/articles/blocks";
import { getDb } from "@/lib/db";
import { articleViewsDaily, articles } from "@/lib/db/schema";

const RETENTION_DAYS = 30;

// Public view-count beacon. Deliberately does NOT invalidate any cache
// (ADR 0001): views are a ranking signal read by the recirculation planner,
// which refreshes on its own cacheLife("hours") schedule.
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

  const db = getDb();
  const updated = await db
    .update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .returning({ id: articles.id });

  const articleId = updated[0]?.id;
  if (articleId) {
    await db
      .insert(articleViewsDaily)
      .values({ articleId, day: sql`CURRENT_DATE`, count: 1 })
      .onConflictDoUpdate({
        target: [articleViewsDaily.articleId, articleViewsDaily.day],
        set: { count: sql`${articleViewsDaily.count} + 1` },
      });
    // Documented retention bound: rollups older than 30 days are pruned
    // opportunistically on write (the trending window only needs 7).
    // sql.raw: a bound parameter here makes `date - $1` ambiguous in Postgres.
    await db
      .delete(articleViewsDaily)
      .where(
        sql`${articleViewsDaily.day} < CURRENT_DATE - ${sql.raw(String(RETENTION_DAYS))}`,
      );
  }

  return new Response(null, { status: 204 });
}
