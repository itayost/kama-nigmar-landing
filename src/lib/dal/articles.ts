import { cacheLife, cacheTag } from "next/cache";
import { and, arrayContains, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articles, type Article } from "@/lib/db/schema";

export async function getPublishedArticles(tag?: string): Promise<Article[]> {
  "use cache";
  cacheLife("max");
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
  cacheLife("max");
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
  cacheLife("max");
  cacheTag("articles", `article-${slug}`);
  const rows = await getDb()
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllTags(): Promise<string[]> {
  "use cache";
  cacheLife("max");
  cacheTag("articles");
  const rows = await getDb()
    .select({ tags: articles.tags })
    .from(articles)
    .where(eq(articles.status, "published"));
  return [...new Set(rows.flatMap((row) => row.tags))].sort((a, b) =>
    a.localeCompare(b, "he"),
  );
}
