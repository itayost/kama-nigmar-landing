import { Fragment, Schema, Slice } from "@tiptap/pm/model";
import { EditorState, TextSelection } from "@tiptap/pm/state";
import { describe, expect, test } from "vitest";
import { flattenPastedBlocks } from "./paste";

// Mirrors the inline editor: the document holds exactly one paragraph.
const schema = new Schema({
  nodes: {
    doc: { content: "paragraph" },
    paragraph: { content: "inline*" },
    text: { group: "inline" },
    hardBreak: { inline: true, group: "inline" },
  },
});

const paragraph = (text: string) => schema.node("paragraph", null, [schema.text(text)]);

function pasteInto(slice: Slice) {
  const doc = schema.node("doc", null, [paragraph("start ")]);
  const state = EditorState.create({ doc, selection: TextSelection.create(doc, 7) });
  return state.tr.replaceSelection(flattenPastedBlocks(slice, schema)).doc.toJSON();
}

describe("flattenPastedBlocks", () => {
  test("keeps every pasted paragraph as a line instead of dropping all but the first", () => {
    // Arrange
    const slice = new Slice(Fragment.from([paragraph("א"), paragraph("ב"), paragraph("ג")]), 1, 1);

    // Act
    const doc = pasteInto(slice);

    // Assert
    expect(doc).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "start א" },
            { type: "hardBreak" },
            { type: "text", text: "ב" },
            { type: "hardBreak" },
            { type: "text", text: "ג" },
          ],
        },
      ],
    });
  });

  test("leaves a single-paragraph paste untouched", () => {
    const slice = new Slice(Fragment.from(paragraph("א")), 1, 1);
    expect(flattenPastedBlocks(slice, schema)).toBe(slice);
  });
});
