import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { readingTimeMinutes } from "@/lib/articles/reading-time";
import {
  planRecirculation,
  rankTrending,
  type RecirculationPlan,
} from "@/lib/articles/recirculation";
import { getDb } from "@/lib/db";
import { articleViewsDaily, articles, type Article } from "@/lib/db/schema";
import { type WithTaxonomy } from "@/lib/taxonomy/public";
import { decorate } from "./taxonomy";

// An article as lists show it: with its subject and tags, and without its
// body, which only the article page needs. Every list reads one cached copy
// of the archive, so it stays small.
export type ArticleView = WithTaxonomy<
  Omit<Article, "content" | "tags"> & { readonly readingMinutes: number; readonly blockCount: number }
>;

// The article page's full article, body included.
export type ArticleDetail = WithTaxonomy<Omit<Article, "tags">>;

type ArticleColumns = ReturnType<typeof getTableColumns<typeof articles>>;

// Every column but the legacy `tags` mirror, which the site never reads.
const siteColumns = (() => {
  const columns: Partial<ArticleColumns> = { ...getTableColumns(articles) };
  delete columns.tags;
  return columns as Omit<ArticleColumns, "tags">;
})();

function toListed({ content, ...article }: Omit<Article, "tags">) {
  return { ...article, readingMinutes: readingTimeMinutes(content), blockCount: content.length };
}

export async function getPublishedArticles(): Promise<ArticleView[]> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  const rows = getDb()
    .select(siteColumns)
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .then((list) => list.map(toListed));
  return decorate(rows);
}

export async function getArticleByNumber(number: number): Promise<ArticleDetail | null> {
  "use cache";
  cacheLife("article");
  cacheTag("articles", `article-${number}`);
  const rows = getDb()
    .select(siteColumns)
    .from(articles)
    .where(and(eq(articles.number, number), eq(articles.status, "published")))
    .limit(1);
  const [article] = await decorate(rows);
  return article ?? null;
}

// Views received in the trailing 7 days, keyed by article id (ADR 0001).
// Cached on its own so every recirculation entry shares one aggregate.
async function fetchWeeklyViews(): Promise<Record<string, number>> {
  "use cache";
  cacheLife("hours");
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

// Recirculation ranks by shared tag and subject ids; only what it reads.
function forRanking(article: ArticleView) {
  return {
    id: article.id,
    publishedAt: article.publishedAt,
    tags: article.tagList.map((tag) => tag.id),
    subjects: article.subjects.map((subject) => subject.id),
  };
}

// Maps ranked ids back to the listed articles.
function resolveIds(published: readonly ArticleView[]) {
  const byId = new Map(published.map((article) => [article.id, article]));
  return (list: readonly { readonly id: string }[]) => list.flatMap((item) => byId.get(item.id) ?? []);
}

// cacheLife("hours") instead of the article profile: rankings blend in view
// counts, which accumulate without cache invalidation, so results refresh
// periodically in addition to instantly on publish (the "articles" tag).
export async function getRecirculation(number: number): Promise<RecirculationPlan<ArticleView>> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles");
  const [published, weeklyViews] = await Promise.all([
    getPublishedArticles(),
    fetchWeeklyViews(),
  ]);
  const current = published.find((article) => article.number === number);
  if (!current) return { midArticle: [], related: [], trending: [] };
  const back = resolveIds(published);
  const plan = planRecirculation(
    { ...forRanking(current), blockCount: current.blockCount },
    published.map(forRanking),
    weeklyViews,
  );
  return { midArticle: back(plan.midArticle), related: back(plan.related), trending: back(plan.trending) };
}

export async function getTrendingArticles(limit: number): Promise<ArticleView[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles");
  const [published, weeklyViews] = await Promise.all([getPublishedArticles(), fetchWeeklyViews()]);
  return resolveIds(published)(rankTrending(published.map(forRanking), weeklyViews, limit));
}
