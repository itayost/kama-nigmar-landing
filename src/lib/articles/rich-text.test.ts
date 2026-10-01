import { describe, expect, test } from "vitest";
import {
  isSafeHref,
  normalizeRuns,
  richTextPlainText,
  richTextSchema,
} from "./rich-text";

describe("isSafeHref", () => {
  test("accepts http and https URLs only", () => {
    expect(isSafeHref("https://example.com/a")).toBe(true);
    expect(isSafeHref("http://example.com")).toBe(true);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,<b>x</b>")).toBe(false);
    expect(isSafeHref("/relative")).toBe(false);
    expect(isSafeHref("not a url")).toBe(false);
  });
});

describe("normalizeRuns", () => {
  test("drops empty runs and merges neighbours with identical formatting", () => {
    expect(
      normalizeRuns([
        { text: "שלום " },
        { text: "" },
        { text: "עולם", marks: [] },
        { text: " מודגש", marks: ["bold"] },
        { text: " גם", marks: ["bold"] },
      ]),
    ).toEqual([
      { text: "שלום עולם" },
      { text: " מודגש גם", marks: ["bold"] },
    ]);
  });

  test("orders and dedupes marks so equal formatting merges regardless of order", () => {
    expect(
      normalizeRuns([
        { text: "א", marks: ["underline", "bold"] },
        { text: "ב", marks: ["bold", "underline", "bold"] },
      ]),
    ).toEqual([{ text: "אב", marks: ["bold", "underline"] }]);
  });

  test("keeps runs with different links apart", () => {
    expect(
      normalizeRuns([
        { text: "א", href: "https://a.com" },
        { text: "ב", href: "https://b.com" },
      ]),
    ).toEqual([
      { text: "א", href: "https://a.com" },
      { text: "ב", href: "https://b.com" },
    ]);
  });
});

describe("richTextPlainText", () => {
  test("concatenates run text", () => {
    expect(richTextPlainText([{ text: "שלום " }, { text: "עולם", marks: ["bold"] }])).toBe(
      "שלום עולם",
    );
  });
});

describe("richTextSchema", () => {
  const schema = richTextSchema("חובה למלא טקסט");

  test("accepts formatted runs and links", () => {
    expect(
      schema.safeParse([
        { text: "טקסט ", marks: ["bold", "highlight"] },
        { text: "קישור", href: "https://example.com" },
      ]).success,
    ).toBe(true);
  });

  test("rejects whitespace-only content with the given message", () => {
    const result = schema.safeParse([{ text: "  \n " }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("חובה למלא טקסט");
    }
  });

  test("rejects unsafe links and unknown marks", () => {
    expect(schema.safeParse([{ text: "x", href: "javascript:alert(1)" }]).success).toBe(false);
    expect(schema.safeParse([{ text: "x", marks: ["code"] }]).success).toBe(false);
  });
});
