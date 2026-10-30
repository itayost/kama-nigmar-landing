import { describe, expect, it } from "vitest";
import { planBackfill } from "./backfill-plan";
import { TAXONOMY_MAPPING } from "./mapping";
import { PUBLISHED_2026_10_30 } from "./fixtures/published-2026-10-30";

// The agreed outcome for the 27 articles published on 2026-10-30.
const EXPECTED: Record<number, [primary: string | null, format: string]> = {
  27: ["world-football", "story"],
  26: ["world-football", "story"],
  25: ["world-football", "story"],
  24: [null, "story"],
  23: ["israeli-football", "story"],
  22: [null, "story"],
  21: ["world-football", "roundup"],
  20: ["israeli-football", "story"],
  19: ["israeli-football", "story"],
  18: ["world-football", "guide"],
  17: ["israeli-football", "story"],
  16: ["israeli-football", "story"],
  15: [null, "roundup"],
  14: ["israeli-football", "story"],
  13: [null, "roundup"],
  12: [null, "roundup"],
  11: ["world-football", "story"],
  10: ["olympic-sports", "story"],
  9: [null, "roundup"],
  8: [null, "roundup"],
  7: ["world-football", "story"],
  6: ["israeli-football", "story"],
  5: [null, "roundup"],
  4: [null, "roundup"],
  3: ["world-football", "story"],
  2: [null, "roundup"],
  1: [null, "roundup"],
};

const registry = [...new Set(PUBLISHED_2026_10_30.flatMap((a) => a.tags))];
const plan = planBackfill({ articles: PUBLISHED_2026_10_30, registry }, TAXONOMY_MAPPING);

describe("TAXONOMY_MAPPING on the published articles", () => {
  it("covers every article in the fixture", () => {
    expect(plan.articles).toHaveLength(Object.keys(EXPECTED).length);
  });

  it("gives every article the agreed primary subject and format", () => {
    const actual = Object.fromEntries(
      plan.articles.map((a) => [a.number, [a.primarySubject, a.format]]),
    );
    expect(actual).toEqual(EXPECTED);
  });

  it("flags exactly the articles that need an editor's look", () => {
    const flagged = plan.articles.filter((a) => a.flags.length > 0).map((a) => a.number);
    expect(flagged.sort((a, b) => a - b)).toEqual([1, 2, 4, 5, 8, 9, 12, 13, 22, 24]);
  });

  it("lists #14 on both football subjects with Israeli football first", () => {
    const a14 = plan.articles.find((a) => a.number === 14);
    expect(a14?.subjects).toEqual(["israeli-football", "world-football"]);
    expect(a14?.tags.map((t) => t.name)).toEqual(["ליגת אלופות"]);
  });

  it("puts roundup #15 on all five subjects", () => {
    expect(plan.articles.find((a) => a.number === 15)?.subjects).toEqual([
      "israeli-football",
      "world-football",
      "basketball",
      "olympic-sports",
      "motorsport",
    ]);
  });

  it("removes the four tags that became subjects, a format or were retired", () => {
    expect(new Set(plan.tags.deletes)).toEqual(
      new Set(["כדורגל", "כדורגל ישראלי", "כדורגל אירופי", "סוף שבוע"]),
    );
  });

  it("renames the three tags to their league or series names", () => {
    expect(new Set(plan.tags.renames)).toEqual(
      new Set([
        { from: "כדורגל אנגלי", to: "פרמייר ליג" },
        { from: "כדורגל איטלקי", to: "סרייה A" },
        { from: "פורמולה", to: "פורמולה 1" },
      ]),
    );
  });

  it("keeps 15 tags, two of them waiting in the inbox", () => {
    expect(plan.tags.keep).toHaveLength(15);
    expect(plan.tags.keep.filter((t) => t.subject === null).map((t) => t.name).sort()).toEqual(
      ["ליגיונרים", "ספורט ישראלי"].sort(),
    );
  });

  it("seeds five subjects with motorsport off the homepage", () => {
    expect(plan.subjects.map((s) => [s.slug, s.onHomepage])).toEqual([
      ["israeli-football", true],
      ["world-football", true],
      ["basketball", true],
      ["olympic-sports", true],
      ["motorsport", false],
    ]);
  });
});
