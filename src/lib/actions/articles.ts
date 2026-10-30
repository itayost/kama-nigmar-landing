"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { eq, inArray } from "drizzle-orm";
import {
  articleInputSchema,
  blocksSchema,
  type ArticleBlock,
  type ArticleInput,
} from "@/lib/articles/blocks";
import { requireAdmin } from "@/lib/auth/require-admin";
import { parseDatetimeLocalIsrael } from "@/lib/datetime";
import { getDb } from "@/lib/db";
import { runAtomic } from "@/lib/db/atomic";
import { articles, articleTags, subjects, tags as tagsTable, type NewArticle } from "@/lib/db/schema";
import { isUuid } from "@/lib/uuid";
import { parseVideoUrl } from "@/lib/video/parseVideoUrl";

export interface ArticleFormState {
  readonly errors: Record<string, string>;
}

// updateTag() expires the cached DAL reads; the revalidatePath calls also drop the
// prerendered output built from them, for the surfaces that list articles rather than
// render one. The article page itself no longer needs a path here — resolveArticle() is
// request-time (see articles/[slug]/page.tsx), so there is no per-article artifact left to
// go stale — but the literal path is kept because it is free and self-documenting.
// A literal path takes no type argument; only a pattern like /articles/[slug] would.
function revalidateArticle(number: number): void {
  updateTag("articles");
  updateTag(`article-${number}`);
  revalidatePath(`/articles/${number}`);
  revalidatePath("/articles");
  revalidatePath("/");
  // Route handlers built from the same list, and so stale by the same mechanism.
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
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

function optionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value !== "" ? value : undefined;
}

function optionalInt(formData: FormData, key: string): number | undefined {
  const value = optionalString(formData, key);
  return value === undefined ? undefined : Number(value);
}

type ParsedArticle =
  | { readonly errors: Record<string, string> }
  | { readonly data: ArticleInput; readonly content: ArticleBlock[] };

function parseArticleForm(formData: FormData): ParsedArticle {
  const contentResult = parseContentField(formData.get("content"));
  const publishedAtRaw = optionalString(formData, "publishedAt");

  const parsed = articleInputSchema.safeParse({
    title: formData.get("title"),
    subtitle: optionalString(formData, "subtitle"),
    authorName: formData.get("authorName"),
    tagIds: formData.getAll("tagIds").filter((value) => typeof value === "string"),
    primarySubjectId: optionalString(formData, "primarySubjectId"),
    format: optionalString(formData, "format"),
    status: formData.get("status"),
    episodeUrl: optionalString(formData, "episodeUrl"),
    pollId: optionalString(formData, "pollId"),
    // The datetime-local value is a naive wall-clock string; interpret it
    // in Israel time (matching how the form displays it) instead of letting
    // the server's own time zone shift it on every save.
    publishedAt: publishedAtRaw ? (parseDatetimeLocalIsrael(publishedAtRaw) ?? publishedAtRaw) : undefined,
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    coverCredit: optionalString(formData, "coverCredit"),
    coverFocusX: optionalInt(formData, "coverFocusX"),
    coverFocusY: optionalInt(formData, "coverFocusY"),
    content: "blocks" in contentResult ? contentResult.blocks : [],
  });

  if (!parsed.success || "error" in contentResult) {
    const errors: Record<string, string> = {};
    if ("error" in contentResult) errors.content = contentResult.error;
    for (const issue of parsed.success ? [] : parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (field !== "content" || !errors.content) errors[field] ??= issue.message;
    }
    return { errors };
  }

  const content = normalizeVideoBlocks(parsed.data.content);
  if (!content) return { errors: { content: "אחד מקישורי הסרטונים אינו תקין" } };
  const episodeUrl = parsed.data.episodeUrl || null;
  if (episodeUrl !== null && parseVideoUrl(episodeUrl)?.provider !== "spotify") {
    return { errors: { episodeUrl: "קישור הפרק חייב להיות קישור לפרק בספוטיפיי" } };
  }
  return { data: parsed.data, content };
}

type Db = ReturnType<typeof getDb>;

// Tag names in the picked order, or an error when a tag or the subject was
// deleted while the form was open.
async function resolveTaxonomy(db: Db, input: ArticleInput): Promise<string[] | { error: string }> {
  const [rows, subject] = await Promise.all([
    input.tagIds.length > 0
      ? db.select({ id: tagsTable.id, name: tagsTable.name }).from(tagsTable).where(inArray(tagsTable.id, input.tagIds))
      : [],
    input.primarySubjectId
      ? db.select({ id: subjects.id }).from(subjects).where(eq(subjects.id, input.primarySubjectId)).limit(1)
      : null,
  ]);
  const names = new Map(rows.map((row) => [row.id, row.name]));
  if (names.size !== input.tagIds.length) return { error: "אחת התגיות נמחקה בינתיים. רעננו את הדף" };
  if (subject && !subject[0]) return { error: "הנושא נמחק בינתיים. רעננו את הדף" };
  return input.tagIds.map((id) => names.get(id) ?? "");
}

// Saves the article and its ordered tag links in one atomic batch.
async function writeArticle(
  db: Db,
  articleId: string | null,
  values: Omit<NewArticle, "id">,
  tagIds: readonly string[],
): Promise<number | null> {
  const id = articleId ?? crypto.randomUUID();
  const save = articleId
    ? db.update(articles).set(values).where(eq(articles.id, id)).returning({ number: articles.number })
    : db.insert(articles).values({ ...values, id }).returning({ number: articles.number });
  const clearLinks = db.delete(articleTags).where(eq(articleTags.articleId, id));
  const links = tagIds.map((tagId, position) => ({ articleId: id, tagId, position }));

  const [saved] =
    links.length > 0
      ? await runAtomic(db, [save, clearLinks, db.insert(articleTags).values(links)])
      : await runAtomic(db, [save, clearLinks]);
  return saved[0]?.number ?? null;
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

  const parsed = parseArticleForm(formData);
  if ("errors" in parsed) return { errors: parsed.errors };
  const { data, content } = parsed;

  const db = getDb();
  const tagNames = await resolveTaxonomy(db, data);
  if ("error" in tagNames) return { errors: { tagIds: tagNames.error } };

  let previousPublishedAt: Date | null = null;
  if (articleId) {
    const existing = await db
      .select({ publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);
    if (!existing[0]) return { errors: { form: "הכתבה לא נמצאה" } };
    previousPublishedAt = existing[0].publishedAt;
  }

  const isPublished = data.status === "published";
  const savedNumber = await writeArticle(
    db,
    articleId,
    {
      title: data.title,
      subtitle: data.subtitle || null,
      coverImageUrl: data.coverImageUrl || null,
      coverCredit: data.coverCredit || null,
      coverFocusX: data.coverFocusX ?? null,
      coverFocusY: data.coverFocusY ?? null,
      content,
      authorName: data.authorName,
      episodeUrl: data.episodeUrl || null,
      pollId: data.pollId ?? null,
      primarySubjectId: data.primarySubjectId ?? null,
      format: data.format,
      // Mirrors the links for a rollback to the code before article_tags.
      tags: tagNames,
      status: data.status,
      publishedAt: data.publishedAt ?? previousPublishedAt ?? (isPublished ? new Date() : null),
      updatedAt: new Date(),
    },
    data.tagIds,
  );

  if (savedNumber !== null) {
    revalidateArticle(savedNumber);
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

  revalidateArticle(article.number);
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

  revalidateArticle(article.number);
}
