import { asc, eq, inArray } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { articles, articleTags, subjects, tags } from "@/lib/db/schema";
import type * as schema from "@/lib/db/schema";
import type { BackfillInput, BackfillPlan } from "./backfill-plan";

type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export async function loadBackfillInput(db: Db): Promise<BackfillInput> {
  const articleRows = await db
    .select({
      id: articles.id,
      number: articles.number,
      title: articles.title,
      subtitle: articles.subtitle,
      tags: articles.tags,
    })
    .from(articles)
    .orderBy(asc(articles.number));
  const tagRows = await db.select({ name: tags.name }).from(tags).orderBy(asc(tags.name));
  return { articles: articleRows, registry: tagRows.map((row) => row.name) };
}

export async function countArticleTags(db: Db): Promise<number> {
  return db.$count(articleTags);
}

function idFor(ids: ReadonlyMap<string, string>, key: string, kind: string): string {
  const id = ids.get(key);
  if (!id) throw new Error(`Unknown ${kind} "${key}"`);
  return id;
}

// Writes the plan in one transaction, so a failure leaves the database as it
// was. Never touches articles.tags or updated_at: readers see no change until
// the new reads ship.
export async function applyBackfillPlan(db: Db, plan: BackfillPlan): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .insert(subjects)
      .values(
        plan.subjects.map(({ slug, name, position, onHomepage }) => ({
          slug,
          name,
          position,
          onHomepage,
        })),
      )
      .onConflictDoNothing();
    const subjectRows = await tx.select({ id: subjects.id, slug: subjects.slug }).from(subjects);
    const subjectIds = new Map(subjectRows.map((row) => [row.slug, row.id]));

    for (const { from, to } of plan.tags.renames) {
      await tx.update(tags).set({ name: to }).where(eq(tags.name, from));
    }
    if (plan.tags.inserts.length > 0) {
      await tx
        .insert(tags)
        .values(plan.tags.inserts.map((name) => ({ name })))
        .onConflictDoNothing();
    }
    for (const tag of plan.tags.keep) {
      const subjectId = tag.subject ? idFor(subjectIds, tag.subject, "subject") : null;
      await tx.update(tags).set({ subjectId }).where(eq(tags.name, tag.name));
    }
    if (plan.tags.deletes.length > 0) {
      await tx.delete(tags).where(inArray(tags.name, [...plan.tags.deletes]));
    }

    const tagRows = await tx.select({ id: tags.id, name: tags.name }).from(tags);
    const tagIds = new Map(tagRows.map((row) => [row.name, row.id]));

    for (const article of plan.articles) {
      const primarySubjectId = article.primarySubject
        ? idFor(subjectIds, article.primarySubject, "subject")
        : null;
      await tx
        .update(articles)
        .set({ format: article.format, primarySubjectId })
        .where(eq(articles.id, article.id));
    }

    const articleIds = plan.articles.map((article) => article.id);
    if (articleIds.length > 0) {
      await tx.delete(articleTags).where(inArray(articleTags.articleId, articleIds));
    }
    const links = plan.articles.flatMap((article) =>
      article.tags.map((tag, position) => ({
        articleId: article.id,
        tagId: idFor(tagIds, tag.name, "tag"),
        position,
      })),
    );
    if (links.length > 0) {
      await tx.insert(articleTags).values(links);
    }
  });
}
