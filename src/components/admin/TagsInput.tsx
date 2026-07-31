"use client";

import { useState } from "react";
import { inputClass } from "./Field";

interface TagsInputProps {
  readonly value: readonly string[];
  readonly onChange: (tags: string[]) => void;
  readonly suggestions?: readonly string[];
}

export function TagsInput({ value, onChange, suggestions = [] }: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const unusedSuggestions = suggestions.filter((name) => !value.includes(name));

  function addTag() {
    // Commas are the CSV separator for the hidden form field, so split
    // pasted input the same way the "," key shortcut does. Otherwise a
    // pasted "a, b" shows as one chip but is saved as two tags.
    const parts = draft.split(",").map((part) => part.trim()).filter(Boolean);
    setDraft("");
    const additions = parts.filter(
      (part, index) => !value.includes(part) && parts.indexOf(part) === index,
    );
    if (additions.length === 0) return;
    onChange([...value, ...additions]);
  }

  function removeTag(tag: string) {
    onChange(value.filter((existing) => existing !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-3 py-1 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`הסרת התגית ${tag}`}
                className="text-text-muted transition-colors hover:text-red-400"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder="הקלידו תגית חדשה ולחצו Enter, או בחרו מהקיימות"
        className={inputClass}
      />
      {unusedSuggestions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-text-muted">תגיות קיימות:</span>
          {unusedSuggestions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange([...value, name])}
              className="rounded-full border border-surface-border px-2.5 py-0.5 text-xs text-text-muted transition-colors hover:border-accent/50 hover:text-white"
            >
              + {name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
