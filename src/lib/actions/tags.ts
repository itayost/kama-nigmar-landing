"use server";

import { updateTag } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { tagNameSchema } from "@/lib/articles/blocks";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import { articles, tags, type Tag } from "@/lib/db/schema";
import { isUuid } from "@/lib/uuid";

export interface TagFormState {
  readonly error?: string;
}

async function findTag(formData: FormData): Promise<Tag | null> {
  const id = formData.get("id");
  if (typeof id !== "string" || !isUuid(id)) return null;
  const rows = await getDb().select().from(tags).where(eq(tags.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createTag(
  _prev: TagFormState,
  formData: FormData,
): Promise<TagFormState> {
  await requireAdmin();
  const parsed = tagNameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await getDb().insert(tags).values({ name: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "התגית כבר קיימת" };
    }
    throw error;
  }

  updateTag("articles");
  return {};
}

export async function renameTag(
  _prev: TagFormState,
  formData: FormData,
): Promise<TagFormState> {
  await requireAdmin();
  const tag = await findTag(formData);
  if (!tag) {
    return { error: "התגית לא נמצאה" };
  }
  const parsed = tagNameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  if (parsed.data === tag.name) return {};

  const db = getDb();
  try {
    await db.update(tags).set({ name: parsed.data }).where(eq(tags.id, tag.id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "קיימת כבר תגית בשם הזה" };
    }
    throw error;
  }

  // Cascade to every article; DISTINCT dedupes when both names were present.
  await db.execute(sql`
    update ${articles}
    set tags = (
      select array_agg(distinct case when t = ${tag.name} then ${parsed.data} else t end)
      from unnest(tags) as t
    )
    where ${tag.name} = any(tags)
  `);

  updateTag("articles");
  return {};
}

export async function deleteTag(formData: FormData): Promise<void> {
  await requireAdmin();
  const tag = await findTag(formData);
  if (!tag) return;

  const db = getDb();
  await db.delete(tags).where(eq(tags.id, tag.id));
  await db.execute(sql`
    update ${articles}
    set tags = array_remove(tags, ${tag.name})
    where ${tag.name} = any(tags)
  `);

  updateTag("articles");
}
