import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import { bindClosingMarks } from "@/lib/articles/title";

// The latest Episode as the podcast's RSS feed describes it. The site never
// hosts audio: the Player bar plays the show on Spotify, which starts from
// this same episode.
export interface Episode {
  readonly title: string;
  // Plain text, cut to DESCRIPTION_MAX: the feed's HTML with tags dropped and
  // entities decoded.
  readonly description: string;
  readonly durationSeconds: number | null;
}

// Far more than one line of the episode row shows; the rest would only add
// to the page.
const DESCRIPTION_MAX = 280;

// Values stay text (a duration of "987" is not turned into a number) and
// attributes are skipped: only the item's own text is read.
const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false });

const documentSchema = z.object({
  rss: z.object({ channel: z.object({ item: z.unknown().optional() }) }),
});

const itemSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  "itunes:duration": z.string().optional(),
});

// Feeds list the newest episode first, and only that one is read, so the cost
// stays flat as the archive grows: the download stops once the first item has
// arrived, and the text is closed off after it.
const FIRST_ITEM_END = "</item>";

export async function readFirstItem(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      text += decoder.decode(value, { stream: true });
      if (text.includes(FIRST_ITEM_END)) return text;
    }
  } finally {
    await reader.cancel();
  }
}

function throughFirstItem(xml: string): string {
  const end = xml.indexOf(FIRST_ITEM_END);
  return end === -1 ? xml : `${xml.slice(0, end + FIRST_ITEM_END.length)}</channel></rss>`;
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

// Null when the text is not a feed, the feed has no episodes, or the newest
// one has no title.
export function parseLatestEpisode(xml: string): Episode | null {
  let document: unknown;
  try {
    document = parser.parse(throughFirstItem(xml));
  } catch {
    return null;
  }
  const feed = documentSchema.safeParse(document);
  if (!feed.success) return null;
  const [first] = [feed.data.rss.channel.item].flat();
  const item = itemSchema.safeParse(first);
  if (!item.success) return null;

  return {
    title: bindClosingMarks(item.data.title),
    description: clip(htmlToText(item.data.description ?? ""), DESCRIPTION_MAX),
    durationSeconds: parseDuration(item.data["itunes:duration"]),
  };
}

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntity(entity: string, code: string): string {
  if (code.startsWith("#")) {
    const isHex = code[1] === "x" || code[1] === "X";
    const point = isHex ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
    return Number.isInteger(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  }
  return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
}

// Episode descriptions arrive as HTML. React escapes whatever this returns,
// so stripping tags is about reading, not safety.
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntity)
    .replace(/\s+/g, " ")
    .trim();
}

// itunes:duration is "hh:mm:ss", "mm:ss" or plain seconds.
export function parseDuration(value: unknown): number | null {
  if (typeof value === "number") return Number.isInteger(value) && value > 0 ? value : null;
  if (typeof value !== "string") return null;
  const parts = value.trim().split(":");
  if (parts.length > 3 || !parts.every((part) => /^\d+$/.test(part))) return null;
  const seconds = parts.reduce((total, part) => total * 60 + Number(part), 0);
  return seconds > 0 ? seconds : null;
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

// Episode titles open with the show's question: "כמה נגמר ? 23.10.2011".
// Returns what follows it, so the page can draw the question as the wordmark;
// null when the title does not open with it or has nothing after it.
const SHOW_QUESTION = /^כמה נגמר\s*\?\s*/;

export function splitEpisodeTitle(title: string): string | null {
  const match = SHOW_QUESTION.exec(title);
  if (!match) return null;
  const rest = title.slice(match[0].length).trim();
  return rest.length > 0 ? rest : null;
}
