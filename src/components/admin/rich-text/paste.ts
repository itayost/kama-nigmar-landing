import { Fragment, Slice, type Node, type Schema } from "@tiptap/pm/model";

// The inline editor's document holds exactly one paragraph, so ProseMirror
// silently drops every pasted paragraph after the first (plain text is split
// into one paragraph per line). Join the pasted blocks with line breaks instead,
// matching how Enter behaves in that editor.
export function flattenPastedBlocks(slice: Slice, schema: Schema): Slice {
  const textblocks: Node[] = [];
  slice.content.descendants((node) => {
    if (!node.isTextblock) return true;
    textblocks.push(node);
    return false;
  });
  if (textblocks.length < 2) return slice;

  const inline = textblocks.flatMap((block, index) => {
    const children: Node[] = [];
    block.content.forEach((child) => children.push(child));
    return index > 0 ? [schema.nodes.hardBreak.create(), ...children] : children;
  });
  const paragraph = schema.nodes.paragraph.create(null, Fragment.fromArray(inline));
  return new Slice(Fragment.from(paragraph), 1, 1);
}
