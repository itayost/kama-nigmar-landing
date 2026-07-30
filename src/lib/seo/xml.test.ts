import { describe, expect, test } from "vitest";
import { escapeXml } from "./xml";

describe("escapeXml", () => {
  test.each([
    ["plain text", "plain text"],
    ["a & b", "a &amp; b"],
    ["<tag>", "&lt;tag&gt;"],
    ['say "hi"', "say &quot;hi&quot;"],
    ["it's", "it&apos;s"],
    ["</item><script>", "&lt;/item&gt;&lt;script&gt;"],
    ["עברית ללא שינוי", "עברית ללא שינוי"],
    ["", ""],
  ])("escapes %j", (input, expected) => {
    expect(escapeXml(input)).toBe(expected);
  });

  test("escapes ampersand before other entities (no double escaping)", () => {
    expect(escapeXml("&lt;")).toBe("&amp;lt;");
  });
});
