import { asc, inArray, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { articles, articleTags, subjects, tags } from "@/lib/db/schema";
import type * as schema from "@/lib/db/schema";
import type { ArticlePlan, BackfillInput, BackfillPlan, SubjectSeed, TagChanges } from "./backfill-plan";

type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Ids = ReadonlyMap<string, string>;

export async function loadBackfillInput(db: Db): Promise<BackfillInput> {
  const articleRows = await db
    .select({ id: articles.id, number: articles.number, title: articles.title, tags: articles.tags })
    .from(articles)
    .orderBy(asc(articles.number));
  const tagRows = await db.select({ name: tags.name }).from(tags).orderBy(asc(tags.name));
  return { articles: articleRows, registry: tagRows.map((row) => row.name) };
}

function idFor(ids: Ids, key: string, kind: string): string {
  const id = ids.get(key);
  if (!id) throw new Error(`Unknown ${kind} "${key}"`);
  return id;
}

async function seedSubjects(tx: Tx, seeds: readonly SubjectSeed[]): Promise<Ids> {
  await tx.insert(subjects).values([...seeds]).onConflictDoNothing();
  const rows = await tx.select({ id: subjects.id, slug: subjects.slug }).from(subjects);
  return new Map(rows.map((row) => [row.slug, row.id]));
}

async function writeTags(tx: Tx, changes: TagChanges, subjectIds: Ids): Promise<Ids> {
  if (changes.renames.length > 0) {
    const pairs = changes.renames.map(({ from, to }) => sql`(${from}, ${to})`);
    await tx.execute(sql`
      update ${tags} set name = v.to_name
      from (values ${sql.join(pairs, sql`, `)}) as v(from_name, to_name)
      where ${tags.name} = v.from_name
    `);
  }
  if (changes.keep.length > 0) {
    await tx
      .insert(tags)
      .values(
        changes.keep.map((tag) => ({
          name: tag.name,
          subjectId: tag.subject ? idFor(subjectIds, tag.subject, "subject") : null,
        })),
      )
      .onConflictDoUpdate({ target: tags.name, set: { subjectId: sql`excluded.subject_id` } });
  }
  if (changes.deletes.length > 0) {
    await tx.delete(tags).where(inArray(tags.name, [...changes.deletes]));
  }
  const rows = await tx.select({ id: tags.id, name: tags.name }).from(tags);
  return new Map(rows.map((row) => [row.name, row.id]));
}

async function linkArticles(
  tx: Tx,
  plans: readonly ArticlePlan[],
  subjectIds: Ids,
  tagIds: Ids,
): Promise<void> {
  if (plans.length === 0) return;
  const values = plans.map((plan) => {
    const subjectId = plan.primarySubject ? idFor(subjectIds, plan.primarySubject, "subject") : null;
    return sql`(${plan.id}::uuid, ${plan.format}::article_format, ${subjectId}::uuid)`;
  });
  await tx.execute(sql`
    update ${articles} set format = v.format, primary_subject_id = v.subject_id
    from (values ${sql.join(values, sql`, `)}) as v(id, format, subject_id)
    where ${articles.id} = v.id
  `);

  await tx.delete(articleTags).where(inArray(articleTags.articleId, plans.map((plan) => plan.id)));
  const links = plans.flatMap((plan) =>
    plan.tags.map((tag, position) => ({
      articleId: plan.id,
      tagId: idFor(tagIds, tag.name, "tag"),
      position,
    })),
  );
  if (links.length > 0) await tx.insert(articleTags).values(links);
}

// Writes the plan in one transaction, so a failure leaves the database as it
// was. Never touches articles.tags or updated_at: readers see no change until
// the new reads ship.
export async function applyBackfillPlan(db: Db, plan: BackfillPlan): Promise<void> {
  await db.transaction(async (tx) => {
    const subjectIds = await seedSubjects(tx, plan.subjects);
    const tagIds = await writeTags(tx, plan.tags, subjectIds);
    await linkArticles(tx, plan.articles, subjectIds, tagIds);
  });
}
