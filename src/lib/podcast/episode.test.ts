import { describe, expect, it } from "vitest";
import { formatDuration, splitEpisodeTitle } from "./episode";

const NBSP = "\u00A0";

describe("formatDuration", () => {
  it("shows minutes and two-digit seconds", () => {
    expect(formatDuration(849)).toBe("14:09");
    expect(formatDuration(383)).toBe("6:23");
  });

  it("shows hours when there are any", () => {
    expect(formatDuration(3723)).toBe("1:02:03");
  });
});

describe("splitEpisodeTitle", () => {
  it("separates the show's question from the rest of the title", () => {
    expect(splitEpisodeTitle(`כמה נגמר${NBSP}? 23.10.2011`)).toBe("23.10.2011");
    expect(splitEpisodeTitle("כמה נגמר? נבחרת ארגנטינה ומסי")).toBe("נבחרת ארגנטינה ומסי");
  });

  it("returns null for a title that does not open with the question", () => {
    expect(splitEpisodeTitle("פרק מיוחד")).toBeNull();
  });

  it("returns null when the question is the whole title", () => {
    expect(splitEpisodeTitle("כמה נגמר ?")).toBeNull();
  });
});
