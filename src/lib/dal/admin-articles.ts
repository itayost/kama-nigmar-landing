import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { articles, type Article } from "@/lib/db/schema";
import { isUuid } from "@/lib/uuid";

export async function listAllArticles(): Promise<Article[]> {
  await requireAdmin();
  return getDb().select().from(articles).orderBy(desc(articles.updatedAt));
}

export async function getArticleById(id: string): Promise<Article | null> {
  await requireAdmin();
  // A malformed id would make Postgres error on the uuid cast (a 500);
  // treat it as "not found" instead.
  if (!isUuid(id)) return null;
  const rows = await getDb().select().from(articles).where(eq(articles.id, id)).limit(1);
  return rows[0] ?? null;
}
