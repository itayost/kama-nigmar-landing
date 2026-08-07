import { describe, expect, test } from "vitest";
import { parseArticleNumber } from "./article-param";

describe("parseArticleNumber", () => {
  test.each([
    ["7", 7],
    ["1", 1],
    ["123456789", 123456789],
  ])("parses canonical number %s", (param, expected) => {
    expect(parseArticleNumber(param)).toBe(expected);
  });

  test.each(["kmh-ngmr-sykvm-hshbv-2-6-8", "07", "0", "-3", "1.5", "1e3", " 7", "", "7a"])(
    "returns null for non-canonical param %j",
    (param) => {
      expect(parseArticleNumber(param)).toBeNull();
    },
  );
});
