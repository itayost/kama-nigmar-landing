import { cacheLife, cacheTag } from "next/cache";
import { and, arrayContains, desc, eq, sql } from "drizzle-orm";
import {
  planRecirculation,
  rankTrending,
  type RecirculationPlan,
} from "@/lib/articles/recirculation";
import { getDb } from "@/lib/db";
import { articleViewsDaily, articles, type Article } from "@/lib/db/schema";

export async function getPublishedArticles(tag?: string): Promise<Article[]> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  const where = tag
    ? and(eq(articles.status, "published"), arrayContains(articles.tags, [tag]))
    : eq(articles.status, "published");
  return getDb()
    .select()
    .from(articles)
    .where(where)
    .orderBy(desc(articles.publishedAt));
}

export async function getLatestArticles(count: number): Promise<Article[]> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  return getDb()
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(count);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  "use cache";
  cacheLife("article");
  cacheTag("articles", `article-${slug}`);
  const rows = await getDb()
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

export async function getArticleByNumber(number: number): Promise<Article | null> {
  "use cache";
  cacheLife("article");
  cacheTag("articles", `article-${number}`);
  const rows = await getDb()
    .select()
    .from(articles)
    .where(and(eq(articles.number, number), eq(articles.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

// Legacy transliterated slugs resolve to the article number so old shared
// URLs can permanently redirect. Only pre-migration articles have a slug.
export async function getArticleNumberBySlug(slug: string): Promise<number | null> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  const rows = await getDb()
    .select({ number: articles.number })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);
  return rows[0]?.number ?? null;
}

// Views received in the trailing 7 days, keyed by article id (ADR 0001).
async function fetchWeeklyViews(): Promise<Record<string, number>> {
  const rows = await getDb()
    .select({
      articleId: articleViewsDaily.articleId,
      total: sql<number>`sum(${articleViewsDaily.count})::int`,
    })
    .from(articleViewsDaily)
    .where(sql`${articleViewsDaily.day} >= CURRENT_DATE - 6`)
    .groupBy(articleViewsDaily.articleId);
  return Object.fromEntries(rows.map((row) => [row.articleId, row.total]));
}

// cacheLife("hours") instead of "max": rankings blend in view counts, which
// accumulate without cache invalidation, so results refresh periodically
// in addition to instantly on publish (the "articles" tag).
export async function getRecirculation(
  slug: string,
): Promise<RecirculationPlan<Article>> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles");
  const db = getDb();
  const [published, weeklyViews] = await Promise.all([
    db.select().from(articles).where(eq(articles.status, "published")),
    fetchWeeklyViews(),
  ]);
  const current = published.find((article) => article.slug === slug);
  if (!current) return { midArticle: [], related: [], trending: [] };
  return planRecirculation(
    { id: current.id, tags: current.tags, blockCount: current.content.length },
    published,
    weeklyViews,
  );
}

export async function getTrendingArticles(limit: number): Promise<Article[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles");
  const db = getDb();
  const [published, weeklyViews] = await Promise.all([
    db.select().from(articles).where(eq(articles.status, "published")),
    fetchWeeklyViews(),
  ]);
  return rankTrending(published, weeklyViews, limit);
}

export async function getAllTags(): Promise<string[]> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  const rows = await getDb()
    .select({ tags: articles.tags })
    .from(articles)
    .where(eq(articles.status, "published"));
  return [...new Set(rows.flatMap((row) => row.tags))].sort((a, b) =>
    a.localeCompare(b, "he"),
  );
}
