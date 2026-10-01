import type { JSONContent } from "@tiptap/core";
import type { ListBlock } from "./blocks";
import {
  isInlineMark,
  isSafeHref,
  normalizeRuns,
  richTextPlainText,
  type RichText,
  type TextRun,
} from "./rich-text";

// Converters between the stored RichText runs and the Tiptap editor's JSON
// document. Everything coming back from the editor is re-validated here, so a
// paste can never smuggle an unsupported mark or unsafe link into storage.

export type ListContent = Pick<ListBlock, "style" | "items">;

function nodeToRun(node: JSONContent): TextRun | null {
  if (node.type === "hardBreak") return { text: "\n" };
  if (node.type !== "text" || !node.text) return null;
  const marks = (node.marks ?? []).map((mark) => mark.type).filter(isInlineMark);
  const href = node.marks?.find((mark) => mark.type === "link")?.attrs?.href;
  return {
    text: node.text,
    marks,
    ...(typeof href === "string" && isSafeHref(href) ? { href } : {}),
  };
}

function runToNodes(run: TextRun): JSONContent[] {
  const marks = [
    ...(run.href ? [{ type: "link", attrs: { href: run.href } }] : []),
    ...(run.marks ?? []).map((type) => ({ type })),
  ];
  return run.text.split("\n").flatMap((line, index) => [
    ...(index > 0 ? [{ type: "hardBreak" }] : []),
    ...(line === ""
      ? []
      : [{ type: "text", text: line, ...(marks.length > 0 ? { marks } : {}) }]),
  ]);
}

function paragraphNode(runs: RichText): JSONContent {
  const content = runs.flatMap(runToNodes);
  return content.length > 0 ? { type: "paragraph", content } : { type: "paragraph" };
}

// Collects inline runs under a node, separating sibling paragraphs with "\n".
function inlineRuns(node: JSONContent): TextRun[] {
  const paragraphs = (node.content ?? []).filter((child) => child.type === "paragraph");
  const runs = paragraphs.flatMap((paragraph, index) => [
    ...(index > 0 ? [{ text: "\n" }] : []),
    ...(paragraph.content ?? []).map(nodeToRun).filter((run) => run !== null),
  ]);
  return normalizeRuns(runs);
}

export function richTextToDoc(runs: RichText): JSONContent {
  return { type: "doc", content: [paragraphNode(runs)] };
}

export function docToRichText(doc: JSONContent): RichText {
  return inlineRuns(doc);
}

export function listToDoc({ style, items }: ListContent): JSONContent {
  const listItems = (items.length > 0 ? items : [[]]).map((item) => ({
    type: "listItem",
    content: [paragraphNode(item)],
  }));
  return {
    type: "doc",
    content: [{ type: style === "ordered" ? "orderedList" : "bulletList", content: listItems }],
  };
}

export function docToList(doc: JSONContent): ListContent {
  const list = doc.content?.find(
    (node) => node.type === "bulletList" || node.type === "orderedList",
  );
  const items = (list?.content ?? [])
    .map(inlineRuns)
    .filter((runs) => richTextPlainText(runs).trim() !== "");
  return { style: list?.type === "orderedList" ? "ordered" : "bullet", items };
}
