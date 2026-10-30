import { z } from "zod";
import { ARTICLE_FORMATS } from "@/lib/taxonomy/format";
import { richTextSchema, type RichText } from "./rich-text";

export const LIST_STYLES = ["bullet", "ordered"] as const;

export type ListStyle = (typeof LIST_STYLES)[number];

export type VideoProvider = "youtube" | "instagram" | "tiktok" | "spotify";

export interface ParagraphBlock {
  readonly id: string;
  readonly type: "paragraph";
  readonly content: RichText;
}

export interface QuoteBlock {
  readonly id: string;
  readonly type: "quote";
  readonly content: RichText;
  readonly attribution?: string;
}

export interface ListBlock {
  readonly id: string;
  readonly type: "list";
  readonly style: ListStyle;
  readonly items: readonly RichText[];
}

export interface HeadingBlock {
  readonly id: string;
  readonly type: "heading";
  readonly level: 2 | 3;
  readonly text: string;
}

export interface ImageBlock {
  readonly id: string;
  readonly type: "image";
  readonly url: string;
  readonly alt: string;
  readonly caption?: string;
}

export interface VideoBlock {
  readonly id: string;
  readonly type: "video";
  readonly provider: VideoProvider;
  readonly url: string;
  readonly embedUrl: string;
  readonly thumbnailUrl?: string;
}

export type ArticleBlock =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | ListBlock
  | ImageBlock
  | VideoBlock;

// Articles saved before rich text stored paragraphs as plain strings. They are
// still in the database and are converted on read; saving rewrites them.
export interface LegacyParagraphBlock {
  readonly id: string;
  readonly type: "paragraph";
  readonly text: string;
}

export type StoredBlock = ArticleBlock | LegacyParagraphBlock;

function normalizeBlock(block: StoredBlock): ArticleBlock {
  if ("text" in block && block.type === "paragraph") {
    return { id: block.id, type: "paragraph", content: [{ text: block.text }] };
  }
  return block as ArticleBlock;
}

export function normalizeBlocks(blocks: readonly StoredBlock[]): ArticleBlock[] {
  return blocks.map(normalizeBlock);
}

const BLOB_HOSTNAME_SUFFIX = ".public.blob.vercel-storage.com";

export function isBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(BLOB_HOSTNAME_SUFFIX);
  } catch {
    return false;
  }
}

const blockId = z.string().min(1);

export const paragraphBlockSchema = z.object({
  id: blockId,
  type: z.literal("paragraph"),
  content: richTextSchema("חובה למלא טקסט בפסקה"),
});

export const quoteBlockSchema = z.object({
  id: blockId,
  type: z.literal("quote"),
  content: richTextSchema("חובה למלא טקסט בציטוט"),
  attribution: z.string().trim().max(100, "שם המצוטט ארוך מדי").optional(),
});

export const listBlockSchema = z.object({
  id: blockId,
  type: z.literal("list"),
  style: z.enum(LIST_STYLES),
  items: z
    .array(richTextSchema("פריט ברשימה אינו יכול להיות ריק"))
    .min(1, "חובה להוסיף לפחות פריט אחד ברשימה"),
});

export const headingBlockSchema = z.object({
  id: blockId,
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string().min(1, "חובה למלא טקסט בכותרת"),
});

export const imageBlockSchema = z.object({
  id: blockId,
  type: z.literal("image"),
  url: z.string().refine(isBlobUrl, "כתובת התמונה אינה תקינה"),
  alt: z.string().min(1, "חובה למלא טקסט חלופי לתמונה"),
  caption: z.string().optional(),
});

export const videoBlockSchema = z.object({
  id: blockId,
  type: z.literal("video"),
  provider: z.enum(["youtube", "instagram", "tiktok", "spotify"]),
  url: z.string().min(1, "חובה להדביק קישור לסרטון"),
  embedUrl: z.string(),
  thumbnailUrl: z.string().optional(),
});

export const blockSchema = z.discriminatedUnion("type", [
  paragraphBlockSchema,
  headingBlockSchema,
  quoteBlockSchema,
  listBlockSchema,
  imageBlockSchema,
  videoBlockSchema,
]);

export const blocksSchema = z
  .array(blockSchema)
  .min(1, "חובה להוסיף לפחות בלוק תוכן אחד");

export const tagNameSchema = z
  .string()
  .trim()
  .min(1, "חובה למלא שם תגית")
  .max(30, "תגית ארוכה מדי");

export const articleInputSchema = z.object({
  title: z.string().min(1, "חובה למלא כותרת").max(200, "הכותרת ארוכה מדי"),
  subtitle: z.string().max(300, "כותרת המשנה ארוכה מדי").optional(),
  authorName: z.string().min(1, "חובה למלא שם כותב").max(100, "שם הכותב ארוך מדי"),
  // Ordered: the article shows its tags in this order.
  tagIds: z
    .array(z.uuid("תגית לא תקינה"))
    .max(10, "אפשר להוסיף עד 10 תגיות")
    .refine((ids) => new Set(ids).size === ids.length, "אותה תגית נבחרה פעמיים"),
  primarySubjectId: z.uuid("נושא לא תקין").optional(),
  format: z.enum(ARTICLE_FORMATS).default("story"),
  coverCredit: z.string().trim().max(120, "הקרדיט ארוך מדי").optional(),
  coverFocusX: z.number().int().min(0).max(100).optional(),
  coverFocusY: z.number().int().min(0).max(100).optional(),
  status: z.enum(["draft", "published"]),
  // Spotify-episode validation happens in the save action via parseVideoUrl
  // (importing it here would be circular).
  episodeUrl: z.string().trim().optional(),
  pollId: z.uuid("סקר לא תקין").optional(),
  publishedAt: z.coerce.date().optional(),
  coverImageUrl: z
    .string()
    .refine((value) => value === "" || isBlobUrl(value), "כתובת תמונת השער אינה תקינה")
    .optional(),
  content: blocksSchema,
});

export type ArticleInput = z.infer<typeof articleInputSchema>;
