import { cacheLife, cacheTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articleTags, articles, subjects, tags } from "@/lib/db/schema";
import { withTaxonomy, type SubjectSummary, type Taxable, type TagSummary, type WithTaxonomy } from "@/lib/taxonomy/public";

// Public taxonomy reads. Cached under the "articles" tag, which every admin
// change to articles, subjects or tags invalidates.

export async function getSubjects(): Promise<SubjectSummary[]> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  return getDb()
    .select({
      id: subjects.id,
      name: subjects.name,
      slug: subjects.slug,
      color: subjects.color,
      description: subjects.description,
      position: subjects.position,
      onHomepage: subjects.onHomepage,
    })
    .from(subjects)
    .orderBy(asc(subjects.position));
}

interface TagLink extends TagSummary {
  readonly articleId: string;
}

// Every published article's tags, in display order.
async function getTagLinks(): Promise<TagLink[]> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  return getDb()
    .select({ articleId: articleTags.articleId, id: tags.id, name: tags.name, subjectId: tags.subjectId })
    .from(articleTags)
    .innerJoin(tags, eq(tags.id, articleTags.tagId))
    .innerJoin(articles, eq(articles.id, articleTags.articleId))
    .where(eq(articles.status, "published"))
    .orderBy(asc(articleTags.articleId), asc(articleTags.position));
}

// Takes the articles as a promise too, so their query runs alongside the
// taxonomy reads instead of before them.
export async function decorate<T extends Taxable>(
  source: readonly T[] | Promise<readonly T[]>,
): Promise<WithTaxonomy<T>[]> {
  const [list, subjectRows, links] = await Promise.all([source, getSubjects(), getTagLinks()]);
  const subjectsById = new Map(subjectRows.map((subject) => [subject.id, subject]));
  const tagsByArticle = new Map<string, TagSummary[]>();
  for (const { articleId, ...tag } of links) {
    const own = tagsByArticle.get(articleId);
    if (own) own.push(tag);
    else tagsByArticle.set(articleId, [tag]);
  }
  return list.map((article) => withTaxonomy(article, subjectsById, tagsByArticle));
}
