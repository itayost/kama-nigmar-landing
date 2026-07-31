import { z } from "zod";

export type VideoProvider = "youtube" | "instagram" | "tiktok" | "spotify";

export interface ParagraphBlock {
  readonly id: string;
  readonly type: "paragraph";
  readonly text: string;
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

export type ArticleBlock = ParagraphBlock | HeadingBlock | ImageBlock | VideoBlock;

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
  text: z.string().min(1, "חובה למלא טקסט בפסקה"),
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
  imageBlockSchema,
  videoBlockSchema,
]);

export const blocksSchema = z
  .array(blockSchema)
  .min(1, "חובה להוסיף לפחות בלוק תוכן אחד");

export const slugSchema = z
  .string()
  .min(1, "חובה למלא כתובת (slug)")
  .max(100, "הכתובת ארוכה מדי")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "הכתובת יכולה להכיל רק אותיות באנגלית, מספרים ומקפים");

export const tagNameSchema = z
  .string()
  .trim()
  .min(1, "חובה למלא שם תגית")
  .max(30, "תגית ארוכה מדי");

export const articleInputSchema = z.object({
  title: z.string().min(1, "חובה למלא כותרת").max(200, "הכותרת ארוכה מדי"),
  subtitle: z.string().max(300, "כותרת המשנה ארוכה מדי").optional(),
  slug: slugSchema,
  authorName: z.string().min(1, "חובה למלא שם כותב").max(100, "שם הכותב ארוך מדי"),
  tags: z.array(tagNameSchema).max(10, "אפשר להוסיף עד 10 תגיות"),
  status: z.enum(["draft", "published"]),
  // Spotify-episode validation happens in the save action via parseVideoUrl
  // (importing it here would be circular).
  episodeUrl: z.string().trim().optional(),
  publishedAt: z.coerce.date().optional(),
  coverImageUrl: z
    .string()
    .refine((value) => value === "" || isBlobUrl(value), "כתובת תמונת השער אינה תקינה")
    .optional(),
  content: blocksSchema,
});

export type ArticleInput = z.infer<typeof articleInputSchema>;
