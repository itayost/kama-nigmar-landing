import { describe, expect, it } from "vitest";
import { legacyTagRedirect, legacyTagTarget } from "./legacy-tag";
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

describe("legacyTagRedirect", () => {
  it("is permanent where the mapping alone decides", () => {
    expect(legacyTagRedirect({ kind: "roundups" }, null)).toEqual({ path: "/roundups", permanent: true });
    expect(legacyTagRedirect({ kind: "archive" }, null)).toEqual({ path: "/articles", permanent: true });
  });

  it("sends a subject tag to the subject while that subject still exists", () => {
    const target = { kind: "subject", slug: "israeli-football" } as const;
    expect(legacyTagRedirect(target, "israeli-football")).toEqual({ path: "/topics/israeli-football", permanent: true });
    expect(legacyTagRedirect(target, null)).toEqual({ path: "/articles", permanent: false });
  });

  it("filters the tag's current subject, temporarily, since the admin may move it", () => {
    expect(legacyTagRedirect({ kind: "tag", name: "פרמייר ליג" }, "world-football")).toEqual({
      path: "/topics/world-football?tag=%D7%A4%D7%A8%D7%9E%D7%99%D7%99%D7%A8+%D7%9C%D7%99%D7%92",
      permanent: false,
    });
  });

  it("falls back to the archive, temporarily, for a tag not filed anywhere yet", () => {
    expect(legacyTagRedirect({ kind: "tag", name: "ליגיונרים" }, null)).toEqual({ path: "/articles", permanent: false });
  });
});
