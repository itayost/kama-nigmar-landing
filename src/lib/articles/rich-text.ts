import { z } from "zod";

// Canonical order: marks are always stored sorted by this list so runs with
// the same formatting compare equal and merge.
export const INLINE_MARKS = ["bold", "italic", "underline", "strike", "highlight"] as const;

export type InlineMark = (typeof INLINE_MARKS)[number];

export interface TextRun {
  readonly text: string;
  readonly marks?: readonly InlineMark[];
  readonly href?: string;
}

// Inline formatted text stored as plain runs (never HTML), so rendering is
// limited to the elements the renderer chooses. Line breaks are "\n".
export type RichText = readonly TextRun[];

export function isInlineMark(value: string): value is InlineMark {
  return (INLINE_MARKS as readonly string[]).includes(value);
}

export function isSafeHref(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function canonicalMarks(marks: readonly InlineMark[] = []): readonly InlineMark[] {
  return INLINE_MARKS.filter((mark) => marks.includes(mark));
}

function sameFormatting(a: TextRun, b: TextRun): boolean {
  const aMarks = a.marks ?? [];
  const bMarks = b.marks ?? [];
  return (
    a.href === b.href &&
    aMarks.length === bMarks.length &&
    aMarks.every((mark, i) => mark === bMarks[i])
  );
}

function buildRun(text: string, marks: readonly InlineMark[], href?: string): TextRun {
  return {
    text,
    ...(marks.length > 0 ? { marks } : {}),
    ...(href ? { href } : {}),
  };
}

export function normalizeRuns(runs: RichText): TextRun[] {
  return runs.reduce<TextRun[]>((result, run) => {
    if (run.text === "") return result;
    const current = buildRun(run.text, canonicalMarks(run.marks), run.href);
    const previous = result.at(-1);
    if (previous && sameFormatting(previous, current)) {
      return [...result.slice(0, -1), { ...previous, text: previous.text + current.text }];
    }
    return [...result, current];
  }, []);
}

export function richTextPlainText(runs: RichText): string {
  return runs.map((run) => run.text).join("");
}

const textRunSchema = z.object({
  text: z.string().min(1),
  marks: z.array(z.enum(INLINE_MARKS)).optional(),
  href: z.string().refine(isSafeHref, "כתובת הקישור אינה תקינה").optional(),
});

export function richTextSchema(emptyMessage: string) {
  return z
    .array(textRunSchema)
    .refine((runs) => richTextPlainText(runs).trim() !== "", emptyMessage);
}
