import { describe, expect, it } from "vitest";
import { legacyTagTarget } from "./legacy-tag";
import { TAXONOMY_MAPPING } from "./mapping";

describe("legacyTagTarget", () => {
  it("sends a tag that became a subject to that subject's page", () => {
    expect(legacyTagTarget("כדורגל ישראלי", TAXONOMY_MAPPING)).toEqual({ kind: "subject", slug: "israeli-football" });
  });

  it("sends the weekend tag to the roundups", () => {
    expect(legacyTagTarget("סוף שבוע", TAXONOMY_MAPPING)).toEqual({ kind: "roundups" });
  });

  it("looks a kept tag up by its new name after a rename", () => {
    expect(legacyTagTarget("כדורגל אנגלי", TAXONOMY_MAPPING)).toEqual({ kind: "tag", name: "פרמייר ליג" });
  });

  it("looks a kept tag up by its own name otherwise", () => {
    expect(legacyTagTarget("לסטר", TAXONOMY_MAPPING)).toEqual({ kind: "tag", name: "לסטר" });
    expect(legacyTagTarget("ליגיונרים", TAXONOMY_MAPPING)).toEqual({ kind: "tag", name: "ליגיונרים" });
  });

  it("sends a retired tag to the archive", () => {
    expect(legacyTagTarget("כדורגל", TAXONOMY_MAPPING)).toEqual({ kind: "archive" });
  });

  it("looks up a tag the mapping never knew by its name", () => {
    expect(legacyTagTarget("תגית חדשה", TAXONOMY_MAPPING)).toEqual({ kind: "tag", name: "תגית חדשה" });
  });
});
