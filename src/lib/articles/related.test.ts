import { describe, expect, test } from "vitest";
import { rankRelated, type RelatedInput } from "./related";

function make(
  slug: string,
  tags: string[],
  views = 0,
  publishedAt: Date | null = new Date("2026-07-01"),
): RelatedInput {
  return { slug, tags, views, publishedAt };
}

const current = { slug: "current", tags: ["כדורגל", "ליגת העל"] };

describe("rankRelated", () => {
  test("excludes the current article", () => {
    const result = rankRelated(current, [make("current", ["כדורגל"])], 3);
    expect(result).toEqual([]);
  });

  test("orders by shared-tag overlap", () => {
    const both = make("both", ["כדורגל", "ליגת העל"]);
    const one = make("one", ["כדורגל"]);
    const result = rankRelated(current, [one, both], 3);
    expect(result.map((r) => r.slug)).toEqual(["both", "one"]);
  });

  test("breaks equal overlap by views", () => {
    const popular = make("popular", ["כדורגל"], 50);
    const quiet = make("quiet", ["כדורגל"], 3);
    const result = rankRelated(current, [quiet, popular], 3);
    expect(result.map((r) => r.slug)).toEqual(["popular", "quiet"]);
  });

  test("breaks equal overlap and views by recency", () => {
    const older = make("older", ["כדורגל"], 5, new Date("2026-06-01"));
    const newer = make("newer", ["כדורגל"], 5, new Date("2026-07-30"));
    const result = rankRelated(current, [older, newer], 3);
    expect(result.map((r) => r.slug)).toEqual(["newer", "older"]);
  });

  test("fills up to the limit with newest articles when overlap is scarce", () => {
    const related = make("related", ["כדורגל"]);
    const newest = make("newest", ["טניס"], 0, new Date("2026-07-30"));
    const oldest = make("oldest", ["NBA"], 100, new Date("2026-05-01"));
    const result = rankRelated(current, [oldest, newest, related], 3);
    expect(result.map((r) => r.slug)).toEqual(["related", "newest", "oldest"]);
  });

  test("does not duplicate a scored article in the fill", () => {
    const related = make("related", ["כדורגל"], 0, new Date("2026-07-30"));
    const other = make("other", ["טניס"], 0, new Date("2026-06-01"));
    const result = rankRelated(current, [related, other], 2);
    expect(result.map((r) => r.slug)).toEqual(["related", "other"]);
  });

  test("respects the limit", () => {
    const candidates = Array.from({ length: 6 }, (_, i) =>
      make(`a${i}`, ["כדורגל"], i),
    );
    expect(rankRelated(current, candidates, 3)).toHaveLength(3);
  });

  test("returns empty for no candidates", () => {
    expect(rankRelated(current, [], 3)).toEqual([]);
  });

  test("handles null publishedAt without crashing", () => {
    const noDate = make("no-date", ["כדורגל"], 0, null);
    const dated = make("dated", ["כדורגל"], 0, new Date("2026-07-01"));
    const result = rankRelated(current, [noDate, dated], 3);
    expect(result.map((r) => r.slug)).toEqual(["dated", "no-date"]);
  });
});
