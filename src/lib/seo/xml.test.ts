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

describe("escapeXml with characters XML forbids", () => {
  test("drops control characters that would make the feed invalid", () => {
    expect(escapeXml("כותרת\u0000\u0008\u000B\u001F סוף")).toBe("כותרת סוף");
  });

  test("keeps tabs and line breaks, which XML allows", () => {
    expect(escapeXml("a\tb\nc\rd")).toBe("a\tb\nc\rd");
  });

  test("drops lone surrogates and the two non-characters", () => {
    expect(escapeXml("a\uD800b\uDFFFc￾d￿")).toBe("abcd");
  });

  test("keeps characters outside the basic plane", () => {
    expect(escapeXml("⚽ 🏀")).toBe("⚽ 🏀");
  });
});
