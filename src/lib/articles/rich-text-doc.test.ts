import { describe, expect, test } from "vitest";
import { docToList, docToRichText, listToDoc, richTextToDoc } from "./rich-text-doc";

describe("richTextToDoc / docToRichText", () => {
  test("round-trips marks, links and line breaks", () => {
    const runs = [
      { text: "שורה " },
      { text: "מודגשת", marks: ["bold", "underline"] as const },
      { text: "\nשורה שנייה עם " },
      { text: "קישור", href: "https://example.com" },
    ];
    expect(docToRichText(richTextToDoc(runs))).toEqual(runs);
  });

  test("maps hard breaks to newlines", () => {
    const doc = richTextToDoc([{ text: "א\nב" }]);
    expect(doc.content?.[0].content).toEqual([
      { type: "text", text: "א" },
      { type: "hardBreak" },
      { type: "text", text: "ב" },
    ]);
  });

  test("produces an empty paragraph for empty content", () => {
    expect(richTextToDoc([])).toEqual({ type: "doc", content: [{ type: "paragraph" }] });
  });

  test("drops unsafe links and unsupported marks coming from the editor", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "רע",
              marks: [
                { type: "link", attrs: { href: "javascript:alert(1)" } },
                { type: "code" },
                { type: "italic" },
              ],
            },
          ],
        },
      ],
    };
    expect(docToRichText(doc)).toEqual([{ text: "רע", marks: ["italic"] }]);
  });

  test("joins multiple paragraphs with a newline", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "א" }] },
        { type: "paragraph", content: [{ type: "text", text: "ב" }] },
      ],
    };
    expect(docToRichText(doc)).toEqual([{ text: "א\nב" }]);
  });
});

describe("listToDoc / docToList", () => {
  test("round-trips an ordered list", () => {
    const list = {
      style: "ordered" as const,
      items: [[{ text: "ראשון" }], [{ text: "שני", marks: ["bold"] as const }]],
    };
    expect(docToList(listToDoc(list))).toEqual(list);
  });

  test("uses a bullet list node for bullet style", () => {
    expect(listToDoc({ style: "bullet", items: [] }).content?.[0].type).toBe("bulletList");
  });

  test("keeps one empty item so the editor has somewhere to type", () => {
    expect(listToDoc({ style: "bullet", items: [] }).content?.[0].content).toEqual([
      { type: "listItem", content: [{ type: "paragraph" }] },
    ]);
  });

  test("drops blank items when reading back", () => {
    const doc = listToDoc({ style: "bullet", items: [[{ text: "א" }], [], [{ text: " " }]] });
    expect(docToList(doc)).toEqual({ style: "bullet", items: [[{ text: "א" }]] });
  });
});
