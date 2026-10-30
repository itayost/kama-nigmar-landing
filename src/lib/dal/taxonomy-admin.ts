import { asc, count, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { articleTags, subjects, tags } from "@/lib/db/schema";
import { isUuid } from "@/lib/uuid";

export interface AdminSubject {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly color: string;
  readonly description: string | null;
  readonly onHomepage: boolean;
}

export interface AdminTag {
  readonly id: string;
  readonly name: string;
  readonly subjectId: string | null;
  readonly articleCount: number;
}

export interface AdminTaxonomy {
  readonly subjects: readonly AdminSubject[];
  readonly tags: readonly AdminTag[];
}

function selectSubjects() {
  return getDb()
    .select({
      id: subjects.id,
      name: subjects.name,
      slug: subjects.slug,
      color: subjects.color,
      description: subjects.description,
      onHomepage: subjects.onHomepage,
    })
    .from(subjects)
    .orderBy(asc(subjects.position));
}

export async function getAdminSubjects(): Promise<AdminSubject[]> {
  await requireAdmin();
  return selectSubjects();
}

export async function getAdminTaxonomy(): Promise<AdminTaxonomy> {
  await requireAdmin();
  const [subjectRows, tagRows] = await Promise.all([
    selectSubjects(),
    getDb()
      .select({
        id: tags.id,
        name: tags.name,
        subjectId: tags.subjectId,
        articleCount: count(articleTags.articleId),
      })
      .from(tags)
      .leftJoin(articleTags, eq(articleTags.tagId, tags.id))
      .groupBy(tags.id)
      .orderBy(asc(tags.name)),
  ]);
  return { subjects: subjectRows, tags: tagRows };
}

// The article's tag ids in the order the article shows them.
export async function getArticleTagIds(articleId: string): Promise<string[]> {
  await requireAdmin();
  if (!isUuid(articleId)) return [];
  const rows = await getDb()
    .select({ tagId: articleTags.tagId })
    .from(articleTags)
    .where(eq(articleTags.articleId, articleId))
    .orderBy(asc(articleTags.position));
  return rows.map((row) => row.tagId);
}
