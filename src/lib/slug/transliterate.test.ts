import { describe, expect, test } from "vitest";
import { suggestSlug, transliterateHebrew } from "./transliterate";

describe("transliterateHebrew", () => {
  test("maps basic letters", () => {
    expect(transliterateHebrew("שלום")).toBe("shlvm");
    expect(transliterateHebrew("כדורגל")).toBe("kdvrgl");
  });

  test("maps final letters like their base forms", () => {
    expect(transliterateHebrew("ם")).toBe("m");
    expect(transliterateHebrew("ן")).toBe("n");
    expect(transliterateHebrew("ך")).toBe("k");
    expect(transliterateHebrew("ף")).toBe("p");
    expect(transliterateHebrew("ץ")).toBe("ts");
  });

  test("silent letters aleph and ayin map to nothing", () => {
    expect(transliterateHebrew("אע")).toBe("");
  });

  test("strips niqqud", () => {
    expect(transliterateHebrew("שָׁלוֹם")).toBe("shlvm");
  });

  test("maps geresh digraphs", () => {
    expect(transliterateHebrew("ג׳ורג׳")).toBe("jvrj");
    expect(transliterateHebrew("צ'לסי")).toBe("chlsy");
    expect(transliterateHebrew("ז׳ורנל")).toBe("zhvrnl");
  });

  test("passes through non-Hebrew characters", () => {
    expect(transliterateHebrew("NBA 2026")).toBe("NBA 2026");
    expect(transliterateHebrew("מכבי FC")).toBe("mkby FC");
  });
});

describe("suggestSlug", () => {
  test("builds a hyphenated lowercase slug", () => {
    expect(suggestSlug("מכבי ניצחה בדרבי")).toBe("mkby-nytschh-bdrby");
  });

  test("handles mixed Hebrew, English and digits", () => {
    expect(suggestSlug("סיכום NBA 2026")).toBe("sykvm-nba-2026");
  });

  test("collapses punctuation into single hyphens", () => {
    expect(suggestSlug("כמה נגמר?!  —  סיכום")).toBe("kmh-ngmr-sykvm");
  });

  test("returns empty string for empty input", () => {
    expect(suggestSlug("")).toBe("");
  });

  test("caps length at 100 without a trailing hyphen", () => {
    const slug = suggestSlug("א".repeat(50) + " ב".repeat(200));
    expect(slug.length).toBeLessThanOrEqual(100);
    expect(slug.endsWith("-")).toBe(false);
  });

  test("produces valid slug characters only", () => {
    expect(suggestSlug("ג׳וקר: הפתעת העונה (2026)")).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });
});
