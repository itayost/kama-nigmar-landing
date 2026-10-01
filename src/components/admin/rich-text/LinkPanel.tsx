"use client";

import type { Editor } from "@tiptap/core";
import { useState, type KeyboardEvent } from "react";
import { isSafeHref } from "@/lib/articles/rich-text";

// A digit after the colon is a port ("example.com:8080"), not a scheme.
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:(?!\d)/i;

// Bare domains ("example.com") get https:// so writers can paste either form.
function toHref(raw: string): string {
  const trimmed = raw.trim();
  return SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`;
}

interface LinkPanelProps {
  readonly editor: Editor;
  readonly onClose: () => void;
}

export function LinkPanel({ editor, onClose }: LinkPanelProps) {
  const existingHref: unknown = editor.getAttributes("link").href;
  const [draft, setDraft] = useState(typeof existingHref === "string" ? existingHref : "");
  const [error, setError] = useState<string | null>(null);
  const hasLink = editor.isActive("link");

  function apply() {
    const href = toHref(draft);
    if (draft.trim() === "" || !isSafeHref(href)) {
      setError("הקישור אינו תקין, יש להזין כתובת אתר מלאה");
      return;
    }
    const chain = editor.chain().focus();
    if (editor.state.selection.empty && !hasLink) {
      // The link mark is inclusive (autolink), so clear it from the stored
      // marks or whatever the writer types next would join the link.
      chain
        .insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] })
        .unsetMark("link")
        .run();
    } else {
      chain.extendMarkRange("link").setLink({ href }).run();
    }
    onClose();
  }

  function remove() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter must not submit the surrounding article form.
    if (event.key === "Enter") {
      event.preventDefault();
      apply();
    } else if (event.key === "Escape") {
      event.preventDefault();
      editor.commands.focus();
      onClose();
    }
  }

  return (
    <div className="flex flex-col gap-1.5 border-t border-surface-border p-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="url"
          dir="ltr"
          autoFocus
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="https://..."
          aria-label="כתובת הקישור"
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-left text-sm text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={apply}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg-start transition-opacity hover:opacity-90"
        >
          {hasLink ? "עדכון" : "הוספה"}
        </button>
        {hasLink ? (
          <button
            type="button"
            onClick={remove}
            className="rounded-md border border-surface-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-red-400/50 hover:text-red-400"
          >
            הסרת קישור
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
