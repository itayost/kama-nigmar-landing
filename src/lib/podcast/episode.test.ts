import { describe, expect, it } from "vitest";
import { formatDuration } from "./episode";

describe("formatDuration", () => {
  it("shows minutes and two-digit seconds", () => {
    expect(formatDuration(849)).toBe("14:09");
    expect(formatDuration(383)).toBe("6:23");
  });

  it("shows hours when there are any", () => {
    expect(formatDuration(3723)).toBe("1:02:03");
  });
});
