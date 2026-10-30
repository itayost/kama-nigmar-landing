import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  planRecirculation,
  rankTrending,
  type RecirculationPlan,
} from "@/lib/articles/recirculation";
import { getDb } from "@/lib/db";
import { articleViewsDaily, articles, type Article } from "@/lib/db/schema";
import type { WithTaxonomy } from "@/lib/taxonomy/public";
import { decorate } from "./taxonomy";

// An article as the public site shows it: with its subject and tags.
export type ArticleView = WithTaxonomy<Article>;

async function selectPublished(): Promise<Article[]> {
  return getDb()
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt));
}

export async function getPublishedArticles(): Promise<ArticleView[]> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  return decorate(await selectPublished());
}

export async function getArticleByNumber(number: number): Promise<ArticleView | null> {
  "use cache";
  cacheLife("article");
  cacheTag("articles", `article-${number}`);
  const rows = await getDb()
    .select()
    .from(articles)
    .where(and(eq(articles.number, number), eq(articles.status, "published")))
    .limit(1);
  if (!rows[0]) return null;
  const [article] = await decorate(rows);
  return article;
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

// Recirculation ranks by shared tags and subjects, so it plans over tag ids.
function forRanking(article: ArticleView) {
  return {
    ...article,
    tags: article.tagList.map((tag) => tag.id),
    subjects: article.subjectIds,
  };
}

// cacheLife("hours") instead of the article profile: rankings blend in view
// counts, which accumulate without cache invalidation, so results refresh
// periodically in addition to instantly on publish (the "articles" tag).
export async function getRecirculation(number: number): Promise<RecirculationPlan<ArticleView>> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles");
  const [published, weeklyViews] = await Promise.all([
    decorate(await selectPublished()),
    fetchWeeklyViews(),
  ]);
  const current = published.find((article) => article.number === number);
  if (!current) return { midArticle: [], related: [], trending: [] };
  const byId = new Map(published.map((article) => [article.id, article]));
  const plan = planRecirculation(
    { ...forRanking(current), blockCount: current.content.length },
    published.map(forRanking),
    weeklyViews,
  );
  const back = (list: readonly { readonly id: string }[]) => list.flatMap((item) => byId.get(item.id) ?? []);
  return { midArticle: back(plan.midArticle), related: back(plan.related), trending: back(plan.trending) };
}

export async function getTrendingArticles(limit: number): Promise<ArticleView[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles");
  const [published, weeklyViews] = await Promise.all([decorate(await selectPublished()), fetchWeeklyViews()]);
  return rankTrending(published, weeklyViews, limit);
}
