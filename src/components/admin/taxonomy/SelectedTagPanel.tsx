"use client";

import { useState } from "react";
import type { AdminTag } from "@/lib/dal/taxonomy-admin";
import { ConfirmDelete } from "../ConfirmDelete";
import { buttonClass, iconButtonClass, inputClass } from "../Field";
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

// Actions for the tag picked on the board. Moving is done on the board itself.
export function SelectedTagPanel({ tag, others, busy, onRename, onMerge, onDelete, onClose }: SelectedTagPanelProps) {
  const [name, setName] = useState(tag.name);
  const [mergeTarget, setMergeTarget] = useState("");

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
        <button type="button" onClick={onClose} aria-label="סגירה" className={`${iconButtonClass} ms-auto h-8 w-8`}>
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
          <input value={name} onChange={(event) => setName(event.target.value)} aria-label="שם התגית" className={`${inputClass} w-44 py-1.5`} />
          <button type="submit" disabled={busy} className={buttonClass}>
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
            <button type="submit" disabled={busy || !mergeTarget} className={buttonClass}>
              מיזוג
            </button>
          </form>
        ) : null}
        <ConfirmDelete
          question="התגית תוסר מכל הכתבות. למחוק?"
          triggerLabel="מחיקת התגית"
          triggerClassName="text-sm text-text-muted transition-colors hover:text-red-400"
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
}
