import { describe, expect, it } from "vitest";
import { planBackfill } from "./backfill-plan";
import { formatBackfillReport } from "./backfill-report";
import { PUBLISHED_2026_10_30 } from "./fixtures/published-2026-10-30";
import { TAXONOMY_MAPPING } from "./mapping";

const registry = [...new Set(PUBLISHED_2026_10_30.flatMap((a) => a.tags))];
const plan = planBackfill({ articles: PUBLISHED_2026_10_30, registry }, TAXONOMY_MAPPING);
const report = formatBackfillReport(plan, TAXONOMY_MAPPING);

describe("formatBackfillReport", () => {
  it("lists the registry changes", () => {
    expect(report).toContain("כדורגל אנגלי -> פרמייר ליג");
    expect(report.split("\n")).toContain("  Delete: כדורגל");
  });

  it("names subjects by their Hebrew name", () => {
    expect(report).toMatch(/#14 .*כדורגל ישראלי/);
  });

  it("ends with the articles that need a look and why", () => {
    const tail = report.slice(report.indexOf("Needs a look (10)"));
    expect(tail).toContain("#24");
    expect(tail).toContain("no subject at all");
    expect(tail).toContain("#13");
    expect(tail).toContain("tag waiting in the inbox");
    expect(tail).not.toContain("#14");
  });

  it("says so when nothing needs a look", () => {
    const clean = planBackfill(
      { articles: PUBLISHED_2026_10_30.filter((a) => a.number === 23), registry: [] },
      TAXONOMY_MAPPING,
    );
    expect(formatBackfillReport(clean, TAXONOMY_MAPPING)).toContain("Needs a look (0)");
  });
});
