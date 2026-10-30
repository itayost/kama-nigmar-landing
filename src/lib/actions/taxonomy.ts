"use server";

import { revalidatePath, updateTag } from "next/cache";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { tagNameSchema } from "@/lib/articles/blocks";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { runAtomic } from "@/lib/db/atomic";
import { isUniqueViolation } from "@/lib/db/errors";
import { articleTags, subjects, tags } from "@/lib/db/schema";
import { subjectInputSchema, tagInputSchema } from "@/lib/taxonomy/admin-schema";

export interface ActionResult {
  readonly error?: string;
}

export interface CreatedTag {
  readonly id: string;
  readonly name: string;
  readonly subjectId: string | null;
}

const idSchema = z.uuid();
const subjectRefSchema = z.uuid().nullable();

// Subjects and tags show up on every page (navigation, labels, sections).
function refresh(): void {
  updateTag("articles");
  revalidatePath("/", "layout");
}

function invalid(): ActionResult {
  return { error: "הבקשה אינה תקינה. רעננו את הדף ונסו שוב" };
}

export async function saveSubject(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId !== "" ? rawId : null;
  if (id !== null && !idSchema.safeParse(id).success) return invalid();

  const parsed = subjectInputSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    color: formData.get("color") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const db = getDb();
  try {
    if (id) {
      await db.update(subjects).set(parsed.data).where(eq(subjects.id, id));
    } else {
      await db.insert(subjects).values({
        ...parsed.data,
        position: sql`(select coalesce(max(${subjects.position}), 0) + 1 from ${subjects})`,
      });
    }
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "כבר קיים נושא עם השם או הכתובת האלה" };
    throw error;
  }
  refresh();
  return {};
}

// Swaps the subject with its neighbor; -1 moves it earlier in the navigation.
export async function moveSubject(subjectId: string, direction: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(subjectId).success || (direction !== -1 && direction !== 1)) return invalid();

  const db = getDb();
  const ordered = await db
    .select({ id: subjects.id, position: subjects.position })
    .from(subjects)
    .orderBy(asc(subjects.position));
  const index = ordered.findIndex((subject) => subject.id === subjectId);
  const neighbor = ordered[index + direction];
  if (index === -1 || !neighbor) return {};

  const current = ordered[index];
  await runAtomic(db, [
    db.update(subjects).set({ position: neighbor.position }).where(eq(subjects.id, current.id)),
    db.update(subjects).set({ position: current.position }).where(eq(subjects.id, neighbor.id)),
  ]);
  refresh();
  return {};
}

export async function setSubjectOnHomepage(subjectId: string, onHomepage: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(subjectId).success || typeof onHomepage !== "boolean") return invalid();
  await getDb().update(subjects).set({ onHomepage }).where(eq(subjects.id, subjectId));
  refresh();
  return {};
}

// Its tags move to the inbox and its articles lose their primary subject.
export async function deleteSubject(subjectId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(subjectId).success) return invalid();
  await getDb().delete(subjects).where(eq(subjects.id, subjectId));
  refresh();
  return {};
}

export async function createTag(
  name: string,
  subjectId: string | null,
): Promise<ActionResult & { readonly tag?: CreatedTag }> {
  await requireAdmin();
  const parsed = tagInputSchema.safeParse({ name, subjectId });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const [tag] = await getDb()
      .insert(tags)
      .values(parsed.data)
      .returning({ id: tags.id, name: tags.name, subjectId: tags.subjectId });
    refresh();
    return { tag };
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "התגית כבר קיימת" };
    throw error;
  }
}

export async function moveTag(tagId: string, subjectId: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(tagId).success || !subjectRefSchema.safeParse(subjectId).success) return invalid();
  await getDb().update(tags).set({ subjectId }).where(eq(tags.id, tagId));
  refresh();
  return {};
}

export async function renameTag(tagId: string, name: string): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(tagId).success) return invalid();
  const parsed = tagNameSchema.safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await getDb().update(tags).set({ name: parsed.data }).where(eq(tags.id, tagId));
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "קיימת כבר תגית בשם הזה" };
    throw error;
  }
  refresh();
  return {};
}

// Moves every article from `sourceId` to `targetId`, then removes the source.
// An article that already has both keeps the target in its current place.
export async function mergeTag(sourceId: string, targetId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(sourceId).success || !idSchema.safeParse(targetId).success || sourceId === targetId) {
    return invalid();
  }
  const db = getDb();
  await runAtomic(db, [
    db.execute(sql`
      insert into ${articleTags} (article_id, tag_id, position)
      select article_id, ${targetId}::uuid, position from ${articleTags} where tag_id = ${sourceId}::uuid
      on conflict do nothing
    `),
    db.delete(tags).where(eq(tags.id, sourceId)),
  ]);
  refresh();
  return {};
}

export async function deleteTag(tagId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(tagId).success) return invalid();
  await getDb().delete(tags).where(eq(tags.id, tagId));
  refresh();
  return {};
}
