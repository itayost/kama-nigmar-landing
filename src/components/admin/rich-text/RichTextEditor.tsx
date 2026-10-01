"use client";

import { Extension, Node, type JSONContent } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";
import { ListItem } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import { Plugin } from "@tiptap/pm/state";
import { StarterKit } from "@tiptap/starter-kit";
import { useMemo, useState } from "react";
import { isSafeHref } from "@/lib/articles/rich-text";
import { flattenPastedBlocks } from "./paste";
import { RichTextToolbar } from "./RichTextToolbar";

// "inline": a single paragraph of formatted text (paragraph and quote blocks).
// "list": exactly one bullet or ordered list with flat, single-paragraph items.
export type RichTextVariant = "inline" | "list";

const DOC_CONTENT: Readonly<Record<RichTextVariant, string>> = {
  inline: "paragraph",
  list: "(bulletList | orderedList)",
};

function restrictedDocument(variant: RichTextVariant) {
  return Node.create({ name: "doc", topNode: true, content: DOC_CONTENT[variant] });
}

// Matches the old textarea: Enter starts a new line inside the same block.
const EnterAsLineBreak = Extension.create({
  name: "enterAsLineBreak",
  priority: 1000,
  addKeyboardShortcuts() {
    return { Enter: () => this.editor.commands.setHardBreak() };
  },
});

const PasteAsLineBreaks = Extension.create({
  name: "pasteAsLineBreaks",
  addProseMirrorPlugins() {
    const { schema } = this.editor;
    return [
      new Plugin({ props: { transformPasted: (slice) => flattenPastedBlocks(slice, schema) } }),
    ];
  },
});

// Items hold a single paragraph, so lists stay flat. Tab/Shift-Tab are dropped
// because nesting or lifting would break that schema; Tab moves focus instead.
const FlatListItem = ListItem.extend({
  content: "paragraph",
  addKeyboardShortcuts() {
    return { Enter: () => this.editor.commands.splitListItem(this.name) };
  },
});

function buildExtensions(variant: RichTextVariant, placeholder: string) {
  const isList = variant === "list";
  return [
    restrictedDocument(variant),
    StarterKit.configure({
      document: false,
      heading: false,
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      trailingNode: false,
      bulletList: isList ? {} : false,
      orderedList: isList ? {} : false,
      listKeymap: isList ? {} : false,
      // Replaced below by a flat item so lists cannot nest.
      listItem: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        isAllowedUri: (url) => isSafeHref(url),
        HTMLAttributes: { rel: "noopener noreferrer", target: null },
      },
    }),
    ...(isList ? [FlatListItem] : [EnterAsLineBreak, PasteAsLineBreaks]),
    Highlight,
    Placeholder.configure({ placeholder, includeChildren: isList }),
  ];
}

interface RichTextEditorProps {
  readonly variant: RichTextVariant;
  // Called once on mount; the editor owns its state afterwards.
  readonly initialContent: () => JSONContent;
  readonly onChange: (doc: JSONContent) => void;
  readonly label: string;
  readonly placeholder: string;
}

export function RichTextEditor({
  variant,
  initialContent,
  onChange,
  label,
  placeholder,
}: RichTextEditorProps) {
  // Stable identities: useEditor diffs options on every render and would
  // otherwise push new options into the editor on each keystroke.
  const [extensions] = useState(() => buildExtensions(variant, placeholder));
  const [content] = useState(initialContent);
  const editorProps = useMemo(
    () => ({
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
        dir: "rtl",
        class: "rich-editor-content",
      },
    }),
    [label],
  );

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    editorProps,
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  });

  return (
    <div className="rich-editor overflow-hidden rounded-lg border border-surface-border bg-surface focus-within:border-accent">
      <RichTextToolbar editor={editor} variant={variant} />
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div aria-hidden="true" className="rich-editor-content" />
      )}
    </div>
  );
}
