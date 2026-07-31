"use client";

import { useActionState, useState } from "react";
import { deleteTag, renameTag, type TagFormState } from "@/lib/actions/tags";
import { inputClass } from "../Field";

const initialState: TagFormState = {};

interface TagRowProps {
  readonly id: string;
  readonly name: string;
  readonly articleCount: number;
}

const smallButtonClass =
  "whitespace-nowrap rounded-md border border-surface-border px-3 py-1.5 text-sm transition-colors hover:border-accent/50";

export function TagRow({ id, name, articleCount }: TagRowProps) {
  const [mode, setMode] = useState<"view" | "rename" | "confirm-delete">("view");
  const [draft, setDraft] = useState(name);
  const [state, renameAction, isRenaming] = useActionState(
    async (prev: TagFormState, formData: FormData) => {
      const result = await renameTag(prev, formData);
      if (!result.error) {
        setMode("view");
      }
      return result;
    },
    initialState,
  );

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      {mode === "rename" ? (
        <form action={renameAction} className="flex flex-1 flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <input
            type="text"
            name="name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className={`${inputClass} max-w-xs`}
            autoFocus
          />
          <button
            type="submit"
            disabled={isRenaming}
            className="whitespace-nowrap rounded-md bg-accent px-3 py-1.5 text-sm font-bold text-bg-start disabled:opacity-50"
          >
            שמירה
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(name);
              setMode("view");
            }}
            className={`${smallButtonClass} text-text-muted`}
          >
            ביטול
          </button>
          {state.error ? (
            <p className="w-full text-sm text-red-400">{state.error}</p>
          ) : null}
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <span className="font-medium">{name}</span>
          <span className="text-sm text-text-muted">
            {articleCount === 1 ? "כתבה אחת" : `${articleCount} כתבות`}
          </span>
        </div>
      )}

      {mode === "view" ? (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setMode("rename")} className={smallButtonClass}>
            שינוי שם
          </button>
          <button
            type="button"
            onClick={() => setMode("confirm-delete")}
            className="whitespace-nowrap rounded-md border border-surface-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-red-400/50 hover:text-red-400"
          >
            מחיקה
          </button>
        </div>
      ) : null}

      {mode === "confirm-delete" ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-red-400">למחוק? התגית תוסר מכל הכתבות</span>
          <form action={deleteTag}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="whitespace-nowrap rounded-md bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
            >
              מחיקה
            </button>
          </form>
          <button
            type="button"
            onClick={() => setMode("view")}
            className={`${smallButtonClass} text-text-muted`}
          >
            ביטול
          </button>
        </div>
      ) : null}
    </li>
  );
}
