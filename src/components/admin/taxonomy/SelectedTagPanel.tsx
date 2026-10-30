"use client";

import { useState } from "react";
import type { AdminTag } from "@/lib/dal/taxonomy-admin";
import { inputClass } from "../Field";
import { CloseIcon } from "../icons";

interface SelectedTagPanelProps {
  readonly tag: AdminTag;
  readonly others: readonly AdminTag[];
  readonly busy: boolean;
  onRename(name: string): void;
  onMerge(targetId: string): void;
  onDelete(): void;
  onClose(): void;
}

const ghostButton =
  "rounded-lg border border-surface-border px-3 py-1.5 text-sm transition-colors hover:border-white/30 disabled:opacity-50";

// Actions for the tag picked on the board. Moving is done on the board itself.
export function SelectedTagPanel({ tag, others, busy, onRename, onMerge, onDelete, onClose }: SelectedTagPanelProps) {
  const [name, setName] = useState(tag.name);
  const [mergeTarget, setMergeTarget] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      role="region"
      aria-label={`פעולות לתגית ${tag.name}`}
      className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-accent/40 bg-bg-start/95 p-4 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <span className="font-bold">{tag.name}</span>
        <span className="text-sm text-text-muted">
          {tag.articleCount === 1 ? "כתבה אחת" : `${tag.articleCount} כתבות`} · בחרו עמודה ולחצו &quot;העברה לכאן&quot;, או גררו
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירה"
          className="ms-auto grid h-8 w-8 place-items-center rounded-md text-text-muted hover:bg-white/10 hover:text-white"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim() && name.trim() !== tag.name) onRename(name);
          }}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="שם התגית"
            className={`${inputClass} w-44 py-1.5`}
          />
          <button type="submit" disabled={busy} className={ghostButton}>
            שינוי שם
          </button>
        </form>
        {others.length > 0 ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (mergeTarget) onMerge(mergeTarget);
            }}
          >
            <select
              value={mergeTarget}
              onChange={(event) => setMergeTarget(event.target.value)}
              aria-label="מיזוג לתוך"
              className={`${inputClass} w-48 py-1.5`}
            >
              <option value="">מיזוג לתוך...</option>
              {others.map((other) => (
                <option key={other.id} value={other.id}>
                  {other.name}
                </option>
              ))}
            </select>
            <button type="submit" disabled={busy || !mergeTarget} className={ghostButton}>
              מיזוג
            </button>
          </form>
        ) : null}
        {confirmDelete ? (
          <span className="flex items-center gap-2 text-sm">
            <span className="text-red-400">התגית תוסר מכל הכתבות. למחוק?</span>
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="rounded-lg bg-red-500/90 px-3 py-1.5 font-medium text-white hover:bg-red-500 disabled:opacity-50"
            >
              מחיקה
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className={ghostButton}>
              לא
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-text-muted transition-colors hover:text-red-400"
          >
            מחיקת התגית
          </button>
        )}
      </div>
    </div>
  );
}
