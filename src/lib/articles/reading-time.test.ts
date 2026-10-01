import { describe, expect, test } from "vitest";
import type { ArticleBlock } from "./blocks";
import { readingTimeLabel, readingTimeMinutes } from "./reading-time";

function paragraph(text: string): ArticleBlock {
  return { id: "p", type: "paragraph", content: [{ text }] };
}

describe("readingTimeMinutes", () => {
  test("returns at least one minute even for tiny articles", () => {
    expect(readingTimeMinutes([paragraph("שלום עולם")])).toBe(1);
    expect(readingTimeMinutes([])).toBe(1);
  });

  test("counts Hebrew words across paragraphs and headings", () => {
    const words250 = Array.from({ length: 250 }, () => "מילה").join(" ");
    const blocks: ArticleBlock[] = [
      { id: "h", type: "heading", level: 2, text: "כותרת ביניים" },
      paragraph(words250),
    ];
    expect(readingTimeMinutes(blocks)).toBe(2);
  });

  test("ignores image and video blocks", () => {
    const blocks: ArticleBlock[] = [
      paragraph("מילה"),
      { id: "i", type: "image", url: "https://x.public.blob.vercel-storage.com/a.jpg", alt: "א" },
      {
        id: "v",
        type: "video",
        provider: "youtube",
        url: "https://youtu.be/dQw4w9WgXcQ",
        embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      },
    ];
    expect(readingTimeMinutes(blocks)).toBe(1);
  });

  test("rounds up partial minutes", () => {
    const words201 = Array.from({ length: 201 }, () => "word").join(" ");
    expect(readingTimeMinutes([paragraph(words201)])).toBe(2);
  });

  test("handles multiple whitespace runs", () => {
    expect(readingTimeMinutes([paragraph("  מילה   אחת\n\nשתיים  ")])).toBe(1);
  });
});

describe("readingTimeMinutes with rich blocks", () => {
  test("counts words in quotes and list items", () => {
    const words100 = Array.from({ length: 100 }, () => "מילה").join(" ");
    const blocks: ArticleBlock[] = [
      paragraph(words100),
      { id: "q", type: "quote", content: [{ text: words100, marks: ["italic"] }] },
      { id: "l", type: "list", style: "bullet", items: [[{ text: "אחת" }], [{ text: "שתיים" }]] },
    ];
    expect(readingTimeMinutes(blocks)).toBe(2);
  });

  test("counts legacy plain-text paragraphs", () => {
    const words201 = Array.from({ length: 201 }, () => "מילה").join(" ");
    expect(readingTimeMinutes([{ id: "p", type: "paragraph", text: words201 }])).toBe(2);
  });
});

describe("readingTimeLabel", () => {
  test("uses the singular form for one minute", () => {
    expect(readingTimeLabel([paragraph("מילה")])).toBe("דקת קריאה");
  });

  test("uses the plural form above one minute", () => {
    const words250 = Array.from({ length: 250 }, () => "מילה").join(" ");
    expect(readingTimeLabel([paragraph(words250)])).toBe("2 דקות קריאה");
  });
});
