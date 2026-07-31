import type { ArticleBlock } from "./blocks";

const WORDS_PER_MINUTE = 200;

export function readingTimeMinutes(blocks: readonly ArticleBlock[]): number {
  const text = blocks
    .filter((block) => block.type === "paragraph" || block.type === "heading")
    .map((block) => block.text)
    .join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function readingTimeLabel(blocks: readonly ArticleBlock[]): string {
  const minutes = readingTimeMinutes(blocks);
  return minutes === 1 ? "דקת קריאה" : `${minutes} דקות קריאה`;
}
