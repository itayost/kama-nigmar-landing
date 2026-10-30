"use server";

import { revalidatePath, updateTag } from "next/cache";
import { asc, eq, sql, type SQL } from "drizzle-orm";
import { tagNameSchema } from "@/lib/articles/blocks";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { runAtomic } from "@/lib/db/atomic";
import { isUniqueViolation } from "@/lib/db/errors";
import { articles, articleTags, subjects, tags } from "@/lib/db/schema";
import type { TaxonomyTag } from "@/lib/dal/taxonomy-admin";
import { optionalString } from "@/lib/form-data";
import { subjectInputSchema, tagInputSchema } from "@/lib/taxonomy/admin-schema";
import { isUuid } from "@/lib/uuid";

export interface ActionResult {
  readonly error?: string;
}

type Db = ReturnType<typeof getDb>;

const INVALID: ActionResult = { error: "הבקשה אינה תקינה. רעננו את הדף ונסו שוב" };

function isId(value: unknown): value is string {
  return typeof value === "string" && isUuid(value);
}

// Subjects and tags show up on every page (navigation, labels, sections).
function refresh(): void {
  updateTag("articles");
  revalidatePath("/", "layout");
}

// Admin check, id validation, the write, then a refresh of every page.
async function adminWrite(
  ids: readonly unknown[],
  write: (db: Db) => Promise<unknown>,
  uniqueMessage?: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!ids.every(isId)) return INVALID;
  try {
    await write(getDb());
  } catch (error) {
    if (uniqueMessage && isUniqueViolation(error)) return { error: uniqueMessage };
    throw error;
  }
  refresh();
  return {};
}

// Keeps the legacy articles.tags mirror in step with a tag change, so rolling
// the code back still shows current names. `next` may use `old.name`.
function mirrorTagChange(db: Db, tagId: string, next: SQL) {
  return db.execute(sql`
    update ${articles} set tags = ${next}
    from ${tags} as old
    where old.id = ${tagId}::uuid and old.name = any(${articles.tags})
  `);
}

export async function saveSubject(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = optionalString(formData, "id");
  const parsed = subjectInputSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    color: formData.get("color") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    await requireAdmin();
    return { error: parsed.error.issues[0].message };
  }
  return adminWrite(
    id ? [id] : [],
    (db) =>
      id
        ? db.update(subjects).set(parsed.data).where(eq(subjects.id, id))
        : db.insert(subjects).values({
            ...parsed.data,
            position: sql`(select coalesce(max(${subjects.position}), 0) + 1 from ${subjects})`,
          }),
    "כבר קיים נושא עם השם או הכתובת האלה",
  );
}

// Swaps the subject with its neighbor; -1 moves it earlier in the navigation.
export async function moveSubject(subjectId: string, direction: -1 | 1): Promise<ActionResult> {
  if (direction !== -1 && direction !== 1) return INVALID;
  return adminWrite([subjectId], async (db) => {
    const ordered = await db
      .select({ id: subjects.id, position: subjects.position })
      .from(subjects)
      .orderBy(asc(subjects.position));
    const index = ordered.findIndex((subject) => subject.id === subjectId);
    const current = ordered[index];
    const neighbor = ordered[index + direction];
    if (!current || !neighbor) return;
    await runAtomic(db, [
      db.update(subjects).set({ position: neighbor.position }).where(eq(subjects.id, current.id)),
      db.update(subjects).set({ position: current.position }).where(eq(subjects.id, neighbor.id)),
    ]);
  });
}

export async function setSubjectOnHomepage(subjectId: string, onHomepage: boolean): Promise<ActionResult> {
  if (typeof onHomepage !== "boolean") return INVALID;
  return adminWrite([subjectId], (db) => db.update(subjects).set({ onHomepage }).where(eq(subjects.id, subjectId)));
}

// Its tags move to the inbox and its articles lose their primary subject.
export async function deleteSubject(subjectId: string): Promise<ActionResult> {
  return adminWrite([subjectId], (db) => db.delete(subjects).where(eq(subjects.id, subjectId)));
}

export async function createTag(
  name: string,
  subjectId: string | null,
): Promise<ActionResult & { readonly tag?: TaxonomyTag }> {
  await requireAdmin();
  const parsed = tagInputSchema.safeParse({ name, subjectId });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  let tag: TaxonomyTag | undefined;
  const result = await adminWrite(
    [],
    async (db) => {
      [tag] = await db
        .insert(tags)
        .values(parsed.data)
        .returning({ id: tags.id, name: tags.name, subjectId: tags.subjectId });
    },
    "התגית כבר קיימת",
  );
  return { ...result, tag };
}

export async function moveTag(tagId: string, subjectId: string | null): Promise<ActionResult> {
  return adminWrite(subjectId === null ? [tagId] : [tagId, subjectId], (db) =>
    db.update(tags).set({ subjectId }).where(eq(tags.id, tagId)),
  );
}

export async function renameTag(tagId: string, name: string): Promise<ActionResult> {
  const parsed = tagNameSchema.safeParse(name);
  if (!parsed.success) {
    await requireAdmin();
    return { error: parsed.error.issues[0].message };
  }
  return adminWrite(
    [tagId],
    (db) =>
      runAtomic(db, [
        mirrorTagChange(db, tagId, sql`array_replace(tags, old.name, ${parsed.data})`),
        db.update(tags).set({ name: parsed.data }).where(eq(tags.id, tagId)),
      ]),
    "קיימת כבר תגית בשם הזה",
  );
}

// Moves every article from `sourceId` to `targetId`, then removes the source.
// An article that already has both keeps the target in its current place.
export async function mergeTag(sourceId: string, targetId: string): Promise<ActionResult> {
  if (sourceId === targetId) return INVALID;
  const targetName = sql`(select name from ${tags} where id = ${targetId}::uuid)`;
  return adminWrite([sourceId, targetId], (db) =>
    runAtomic(db, [
      db.execute(sql`
        insert into ${articleTags} (article_id, tag_id, position)
        select article_id, ${targetId}::uuid, position from ${articleTags} where tag_id = ${sourceId}::uuid
        on conflict do nothing
      `),
      mirrorTagChange(
        db,
        sourceId,
        sql`case when ${targetName} = any(tags) then array_remove(tags, old.name)
                 else array_replace(tags, old.name, ${targetName}) end`,
      ),
      db.delete(tags).where(eq(tags.id, sourceId)),
    ]),
  );
}

export async function deleteTag(tagId: string): Promise<ActionResult> {
  return adminWrite([tagId], (db) =>
    runAtomic(db, [
      mirrorTagChange(db, tagId, sql`array_remove(tags, old.name)`),
      db.delete(tags).where(eq(tags.id, tagId)),
    ]),
  );
}
