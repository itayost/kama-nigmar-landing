import { z } from "zod";
import { tagNameSchema } from "@/lib/articles/blocks";

export const subjectInputSchema = z.object({
  name: z.string().trim().min(1, "חובה למלא שם נושא").max(40, "שם הנושא ארוך מדי"),
  // English, so subject links stay short when shared on WhatsApp.
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "כתובת באנגלית בלבד: אותיות קטנות, ספרות ומקפים")
    .max(40, "הכתובת ארוכה מדי"),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "צבע לא תקין")
    .transform((color) => color.toLowerCase()),
  description: z
    .string()
    .trim()
    .max(160, "התיאור ארוך מדי")
    .transform((text) => (text === "" ? null : text)),
});

export type SubjectInput = z.infer<typeof subjectInputSchema>;

export const tagInputSchema = z.object({
  name: tagNameSchema,
  subjectId: z.uuid("נושא לא תקין").nullable(),
});

export type TagInput = z.infer<typeof tagInputSchema>;
