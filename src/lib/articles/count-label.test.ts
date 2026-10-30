import { describe, expect, it } from "vitest";
import { articleCountLabel } from "./count-label";

describe("articleCountLabel", () => {
  it("says one article in words", () => {
    expect(articleCountLabel(1)).toBe("כתבה אחת");
  });

  it("puts the number before the plural otherwise", () => {
    expect(articleCountLabel(0)).toBe("0 כתבות");
    expect(articleCountLabel(27)).toBe("27 כתבות");
  });
});
