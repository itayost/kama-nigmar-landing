import { asc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { articles, tags } from "@/lib/db/schema";

export interface TagWithCount {
  readonly id: string;
  readonly name: string;
  readonly articleCount: number;
}

export async function listTagsWithCounts(): Promise<TagWithCount[]> {
  await requireAdmin();
  return getDb()
    .select({
      id: tags.id,
      name: tags.name,
      articleCount: sql<number>`(select count(*)::int from ${articles} where ${tags.name} = any(${articles.tags}))`,
    })
    .from(tags)
    .orderBy(asc(tags.name));
}

export async function listTagNames(): Promise<string[]> {
  await requireAdmin();
  const rows = await getDb()
    .select({ name: tags.name })
    .from(tags)
    .orderBy(asc(tags.name));
  return rows.map((row) => row.name);
}
