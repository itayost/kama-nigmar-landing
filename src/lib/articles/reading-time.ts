import { normalizeBlocks, type ArticleBlock, type StoredBlock } from "./blocks";
import { richTextPlainText } from "./rich-text";

const WORDS_PER_MINUTE = 200;

function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case "paragraph":
    case "quote":
      return richTextPlainText(block.content);
    case "list":
      return block.items.map(richTextPlainText).join(" ");
    case "heading":
      return block.text;
    case "image":
    case "video":
      return "";
  }
}

export function readingTimeMinutes(blocks: readonly StoredBlock[]): number {
  const text = normalizeBlocks(blocks).map(blockText).join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function minutesLabel(minutes: number): string {
  return minutes === 1 ? "דקת קריאה" : `${minutes} דקות קריאה`;
}

export function readingTimeLabel(blocks: readonly StoredBlock[]): string {
  return minutesLabel(readingTimeMinutes(blocks));
}
