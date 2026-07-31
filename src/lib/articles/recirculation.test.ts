import { describe, expect, test } from "vitest";
import {
  planRecirculation,
  rankTrending,
  type RecircInput,
} from "./recirculation";

function make(
  slug: string,
  tags: string[],
  publishedAt: Date | null = new Date("2026-07-01"),
): RecircInput {
  return { id: `id-${slug}`, slug, tags, publishedAt };
}

function views(entries: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(entries).map(([slug, count]) => [`id-${slug}`, count]),
  );
}

const longCurrent = { slug: "current", tags: ["כדורגל", "ליגת העל"], blockCount: 6 };
const shortCurrent = { ...longCurrent, blockCount: 3 };

function slugs(list: readonly RecircInput[]): string[] {
  return list.map((item) => item.slug);
}

describe("planRecirculation", () => {
  test("excludes the current article from every placement", () => {
    const plan = planRecirculation(
      longCurrent,
      [make("current", ["כדורגל"])],
      views({ current: 100 }),
    );
    expect(plan.midArticle).toEqual([]);
    expect(plan.related).toEqual([]);
    expect(plan.trending).toEqual([]);
  });

  test("mid-article takes the top overlapping candidates", () => {
    const both = make("both", ["כדורגל", "ליגת העל"]);
    const one = make("one", ["כדורגל"]);
    const none = make("none", ["טניס"]);
    const plan = planRecirculation(longCurrent, [none, one, both], {});
    expect(slugs(plan.midArticle)).toEqual(["both", "one"]);
  });

  test("mid-article is empty for short articles", () => {
    const both = make("both", ["כדורגל", "ליגת העל"]);
    const plan = planRecirculation(shortCurrent, [both], {});
    expect(plan.midArticle).toEqual([]);
    expect(slugs(plan.related)).toEqual(["both"]);
  });

  test("mid-article never fills with non-overlapping articles", () => {
    const unrelated = make("unrelated", ["טניס"], new Date("2026-07-30"));
    const plan = planRecirculation(longCurrent, [unrelated], {});
    expect(plan.midArticle).toEqual([]);
    expect(slugs(plan.related)).toEqual(["unrelated"]);
  });

  test("weekly views break equal overlap, then recency", () => {
    const popular = make("popular", ["כדורגל"], new Date("2026-06-01"));
    const quiet = make("quiet", ["כדורגל"], new Date("2026-06-01"));
    const newer = make("newer", ["כדורגל"], new Date("2026-07-30"));
    const plan = planRecirculation(
      longCurrent,
      [quiet, newer, popular],
      views({ popular: 50 }),
    );
    expect(slugs(plan.midArticle)).toEqual(["popular", "newer"]);
  });

  test("no article appears in two placements", () => {
    const candidates = [
      make("a", ["כדורגל"], new Date("2026-07-30")),
      make("b", ["כדורגל"], new Date("2026-07-29")),
      make("c", ["כדורגל"], new Date("2026-07-28")),
      make("d", ["טניס"], new Date("2026-07-27")),
      make("e", ["NBA"], new Date("2026-07-26")),
    ];
    const plan = planRecirculation(
      longCurrent,
      candidates,
      views({ a: 9, b: 8, c: 7, d: 6, e: 5 }),
    );
    const all = [
      ...slugs(plan.midArticle),
      ...slugs(plan.related),
      ...slugs(plan.trending),
    ];
    expect(new Set(all).size).toBe(all.length);
  });

  test("related fills with newest when overlap is scarce", () => {
    const related = make("related", ["כדורגל"]);
    const newest = make("newest", ["טניס"], new Date("2026-07-30"));
    const older = make("older", ["NBA"], new Date("2026-05-01"));
    const plan = planRecirculation(shortCurrent, [older, newest, related], {});
    expect(slugs(plan.related)).toEqual(["related", "newest", "older"]);
  });

  test("trending only includes articles with weekly views", () => {
    const seen = make("seen", ["טניס"], new Date("2026-06-01"));
    const unseen = make("unseen", ["NBA"], new Date("2026-07-30"));
    const overlap1 = make("o1", ["כדורגל"]);
    const overlap2 = make("o2", ["כדורגל"]);
    const overlap3 = make("o3", ["כדורגל"]);
    const overlap4 = make("o4", ["כדורגל"]);
    const overlap5 = make("o5", ["כדורגל"]);
    const plan = planRecirculation(
      longCurrent,
      [seen, unseen, overlap1, overlap2, overlap3, overlap4, overlap5],
      views({ seen: 3 }),
    );
    expect(slugs(plan.trending)).toEqual(["seen"]);
  });

  test("trending is empty when nothing has views", () => {
    const plan = planRecirculation(
      longCurrent,
      [make("a", ["טניס"]), make("b", ["NBA"])],
      {},
    );
    expect(plan.trending).toEqual([]);
  });

  test("respects custom counts", () => {
    const candidates = Array.from({ length: 10 }, (_, i) =>
      make(`a${i}`, ["כדורגל"], new Date(2026, 5, i + 1)),
    );
    const plan = planRecirculation(longCurrent, candidates, {}, { midCount: 1, relatedCount: 2 });
    expect(plan.midArticle).toHaveLength(1);
    expect(plan.related).toHaveLength(2);
  });

  test("handles empty candidates and null dates", () => {
    expect(planRecirculation(longCurrent, [], {})).toEqual({
      midArticle: [],
      related: [],
      trending: [],
    });
    const noDate = make("no-date", ["כדורגל"], null);
    const plan = planRecirculation(longCurrent, [noDate], {});
    expect(slugs(plan.midArticle)).toEqual(["no-date"]);
  });
});

describe("rankTrending", () => {
  test("ranks by weekly views then recency, dropping zero-view articles", () => {
    const a = make("a", [], new Date("2026-07-01"));
    const b = make("b", [], new Date("2026-07-30"));
    const c = make("c", [], new Date("2026-07-15"));
    const zero = make("zero", []);
    const result = rankTrending([a, b, c, zero], views({ a: 5, b: 5, c: 9 }), 3);
    expect(slugs(result)).toEqual(["c", "b", "a"]);
  });

  test("respects the limit and empty input", () => {
    expect(rankTrending([], {}, 3)).toEqual([]);
    const many = Array.from({ length: 5 }, (_, i) => make(`a${i}`, []));
    expect(rankTrending(many, views({ a0: 1, a1: 2, a2: 3, a3: 4, a4: 5 }), 2)).toHaveLength(2);
  });
});
