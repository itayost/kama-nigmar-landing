"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import {
  articleInputSchema,
  blocksSchema,
  type ArticleBlock,
} from "@/lib/articles/blocks";
import { requireAdmin } from "@/lib/auth/require-admin";
import { parseDatetimeLocalIsrael } from "@/lib/datetime";
import { getDb } from "@/lib/db";
import { articles, tags as tagsTable } from "@/lib/db/schema";
import { isUuid } from "@/lib/uuid";
import { parseVideoUrl } from "@/lib/video/parseVideoUrl";

export interface ArticleFormState {
  readonly errors: Record<string, string>;
}

function parseContentField(
  raw: FormDataEntryValue | null,
): { blocks: ArticleBlock[] } | { error: string } {
  if (typeof raw !== "string" || raw === "") {
    return { error: "חובה להוסיף לפחות בלוק תוכן אחד" };
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: "תוכן הכתבה אינו תקין" };
  }
  const parsed = blocksSchema.safeParse(json);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  return { blocks: parsed.data };
}

// Derived video fields are never trusted from the client: recompute
// provider/embedUrl/thumbnailUrl from the pasted URL.
function normalizeVideoBlocks(blocks: ArticleBlock[]): ArticleBlock[] | null {
  const normalized: ArticleBlock[] = [];
  for (const block of blocks) {
    if (block.type !== "video") {
      normalized.push(block);
      continue;
    }
    const parsed = parseVideoUrl(block.url);
    if (!parsed) return null;
    normalized.push({ id: block.id, type: "video", url: block.url, ...parsed });
  }
  return normalized;
}

export async function saveArticle(
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();

  const idRaw = formData.get("id");
  const articleId = typeof idRaw === "string" && idRaw !== "" ? idRaw : null;
  if (articleId !== null && !isUuid(articleId)) {
    return { errors: { form: "הכתבה לא נמצאה" } };
  }

  const contentResult = parseContentField(formData.get("content"));
  const tagsRaw = formData.get("tags");
  const tags =
    typeof tagsRaw === "string"
      ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];
  const publishedAtRaw = formData.get("publishedAt");
  const subtitleRaw = formData.get("subtitle");
  const episodeUrlRaw = formData.get("episodeUrl");
  const pollIdRaw = formData.get("pollId");

  const parsed = articleInputSchema.safeParse({
    title: formData.get("title"),
    subtitle: typeof subtitleRaw === "string" ? subtitleRaw : undefined,
    authorName: formData.get("authorName"),
    tags,
    status: formData.get("status"),
    episodeUrl: typeof episodeUrlRaw === "string" ? episodeUrlRaw : undefined,
    pollId: typeof pollIdRaw === "string" && pollIdRaw !== "" ? pollIdRaw : undefined,
    // The datetime-local value is a naive wall-clock string; interpret it
    // in Israel time (matching how the form displays it) instead of letting
    // the server's own time zone shift it on every save.
    publishedAt:
      typeof publishedAtRaw === "string" && publishedAtRaw !== ""
        ? (parseDatetimeLocalIsrael(publishedAtRaw) ?? publishedAtRaw)
        : undefined,
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    content: "blocks" in contentResult ? contentResult.blocks : [],
  });

  if (!parsed.success || "error" in contentResult) {
    const errors: Record<string, string> = {};
    if ("error" in contentResult) {
      errors.content = contentResult.error;
    }
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "form");
        if (field !== "content" || !errors.content) {
          errors[field] ??= issue.message;
        }
      }
    }
    return { errors };
  }

  const content = normalizeVideoBlocks(parsed.data.content);
  if (!content) {
    return { errors: { content: "אחד מקישורי הסרטונים אינו תקין" } };
  }

  const episodeUrl = parsed.data.episodeUrl || null;
  if (episodeUrl !== null && parseVideoUrl(episodeUrl)?.provider !== "spotify") {
    return {
      errors: { episodeUrl: "קישור הפרק חייב להיות קישור לפרק בספוטיפיי" },
    };
  }

  const db = getDb();

  let previousNumber: number | null = null;
  let previousPublishedAt: Date | null = null;
  if (articleId) {
    const existing = await db
      .select({ number: articles.number, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);
    if (!existing[0]) {
      return { errors: { form: "הכתבה לא נמצאה" } };
    }
    previousNumber = existing[0].number;
    previousPublishedAt = existing[0].publishedAt;
  }

  const isPublished = parsed.data.status === "published";
  const publishedAt =
    parsed.data.publishedAt ??
    previousPublishedAt ??
    (isPublished ? new Date() : null);

  const values = {
    title: parsed.data.title,
    subtitle: parsed.data.subtitle || null,
    coverImageUrl: parsed.data.coverImageUrl || null,
    content,
    authorName: parsed.data.authorName,
    episodeUrl,
    pollId: parsed.data.pollId ?? null,
    tags: parsed.data.tags,
    status: parsed.data.status,
    publishedAt,
    updatedAt: new Date(),
  };

  // Form-created tags land in the central registry.
  if (parsed.data.tags.length > 0) {
    await db
      .insert(tagsTable)
      .values(parsed.data.tags.map((name) => ({ name })))
      .onConflictDoNothing();
  }

  if (articleId) {
    await db.update(articles).set(values).where(eq(articles.id, articleId));
  } else {
    const inserted = await db
      .insert(articles)
      .values(values)
      .returning({ number: articles.number });
    updateTag(`article-${inserted[0].number}`);
  }

  updateTag("articles");
  if (previousNumber !== null) {
    updateTag(`article-${previousNumber}`);
  }

  redirect("/admin");
}

export async function deleteArticle(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !isUuid(id)) return;

  const db = getDb();
  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  const article = rows[0];
  if (!article) return;

  await db.delete(articles).where(eq(articles.id, id));

  const blobUrls = [
    article.coverImageUrl,
    ...article.content
      .filter((block) => block.type === "image")
      .map((block) => block.url),
  ].filter((url): url is string => Boolean(url));
  if (blobUrls.length > 0) {
    try {
      await del(blobUrls);
    } catch (error) {
      console.error("Failed to delete article blobs", error);
    }
  }

  updateTag("articles");
  updateTag(`article-${article.number}`);
}

export async function toggleArticleStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !isUuid(id)) return;

  const db = getDb();
  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  const article = rows[0];
  if (!article) return;

  const newStatus = article.status === "published" ? "draft" : "published";
  await db
    .update(articles)
    .set({
      status: newStatus,
      publishedAt:
        article.publishedAt ?? (newStatus === "published" ? new Date() : null),
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id));

  updateTag("articles");
  updateTag(`article-${article.number}`);
}
