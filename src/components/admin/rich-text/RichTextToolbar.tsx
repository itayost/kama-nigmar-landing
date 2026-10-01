"use client";

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { useState, type ReactNode } from "react";
import type { InlineMark } from "@/lib/articles/rich-text";
import { LinkPanel } from "./LinkPanel";
import type { RichTextVariant } from "./RichTextEditor";

const MARK_BUTTONS: ReadonlyArray<{
  readonly mark: InlineMark;
  readonly label: string;
  readonly glyph: ReactNode;
}> = [
  { mark: "bold", label: "מודגש (Ctrl+B)", glyph: <span className="font-extrabold">B</span> },
  { mark: "italic", label: "נטוי (Ctrl+I)", glyph: <span className="font-serif italic">I</span> },
  { mark: "underline", label: "קו תחתון (Ctrl+U)", glyph: <span className="underline">U</span> },
  { mark: "strike", label: "קו חוצה (Ctrl+Shift+S)", glyph: <span className="line-through">S</span> },
  {
    mark: "highlight",
    label: "סימון (Ctrl+Shift+H)",
    glyph: <span className="border-b-[3px] border-accent/70 px-0.5 leading-tight">A</span>,
  },
];

const EMPTY_STATE = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  highlight: false,
  link: false,
  bulletList: false,
  orderedList: false,
};

const toolButtonClass =
  "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-white aria-pressed:bg-accent/15 aria-pressed:text-accent disabled:opacity-30";

function ToolButton({
  label,
  isActive,
  onClick,
  disabled,
  children,
}: {
  readonly label: string;
  readonly isActive: boolean;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={isActive}
      disabled={disabled}
      // Keep the text selection in the editor while clicking the toolbar.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={toolButtonClass}
    >
      {children}
    </button>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5L10 5" strokeLinecap="round" />
      <path d="M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l1-1" strokeLinecap="round" />
    </svg>
  );
}

interface RichTextToolbarProps {
  readonly editor: Editor | null;
  readonly variant: RichTextVariant;
}

export function RichTextToolbar({ editor, variant }: RichTextToolbarProps) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const active =
    useEditorState({
      editor,
      selector: ({ editor: current }) =>
        current
          ? {
              bold: current.isActive("bold"),
              italic: current.isActive("italic"),
              underline: current.isActive("underline"),
              strike: current.isActive("strike"),
              highlight: current.isActive("highlight"),
              link: current.isActive("link"),
              bulletList: current.isActive("bulletList"),
              orderedList: current.isActive("orderedList"),
            }
          : EMPTY_STATE,
    }) ?? EMPTY_STATE;

  function toggleMark(mark: InlineMark) {
    editor?.chain().focus().toggleMark(mark).run();
  }

  return (
    <div className="border-b border-surface-border bg-white/[0.02]">
      <div role="toolbar" aria-label="עיצוב טקסט" className="flex flex-wrap items-center gap-0.5 p-1">
        {MARK_BUTTONS.map(({ mark, label, glyph }) => (
          <ToolButton
            key={mark}
            label={label}
            isActive={active[mark]}
            disabled={!editor}
            onClick={() => toggleMark(mark)}
          >
            {glyph}
          </ToolButton>
        ))}
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-surface-border" />
        <ToolButton
          label="קישור"
          isActive={active.link || isLinkOpen}
          disabled={!editor}
          onClick={() => setIsLinkOpen((open) => !open)}
        >
          <LinkIcon />
        </ToolButton>
        {variant === "list" ? (
          <>
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-surface-border" />
            <ToolButton
              label="רשימת תבליטים"
              isActive={active.bulletList}
              disabled={!editor}
              onClick={() => {
                if (!active.bulletList) editor?.chain().focus().toggleBulletList().run();
              }}
            >
              •
            </ToolButton>
            <ToolButton
              label="רשימה ממוספרת"
              isActive={active.orderedList}
              disabled={!editor}
              onClick={() => {
                if (!active.orderedList) editor?.chain().focus().toggleOrderedList().run();
              }}
            >
              <span dir="ltr">1.</span>
            </ToolButton>
          </>
        ) : null}
      </div>
      {isLinkOpen && editor ? (
        <LinkPanel editor={editor} onClose={() => setIsLinkOpen(false)} />
      ) : null}
    </div>
  );
}
