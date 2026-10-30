"use client";

import { useState, type CSSProperties, type DragEvent } from "react";
import type { AdminSubject, AdminTag } from "@/lib/dal/taxonomy-admin";
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, PlusIcon } from "../icons";

export interface ColumnActions {
  readonly selectedId: string | null;
  readonly draggingId: string | null;
  onSelect(tagId: string): void;
  onDragStart(tagId: string): void;
  onDragEnd(): void;
  onMoveHere(subjectId: string | null): void;
  onCreate(name: string, subjectId: string | null): Promise<boolean>;
}

interface TagColumnProps {
  // Null for the inbox of tags without a subject.
  readonly subject: AdminSubject | null;
  readonly tags: readonly AdminTag[];
  readonly isFirst?: boolean;
  readonly isLast?: boolean;
  readonly actions: ColumnActions;
  onEdit?(): void;
  onReorder?(direction: -1 | 1): void;
  onToggleHomepage?(): void;
}

const iconButton =
  "grid h-7 w-7 place-items-center rounded-md text-text-muted transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent";

export function TagColumn({
  subject,
  tags,
  isFirst,
  isLast,
  actions,
  onEdit,
  onReorder,
  onToggleHomepage,
}: TagColumnProps) {
  const [draft, setDraft] = useState("");
  const [isOver, setIsOver] = useState(false);
  const subjectId = subject?.id ?? null;
  const selectedElsewhere =
    actions.selectedId !== null && !tags.some((tag) => tag.id === actions.selectedId);
  const accent = { "--subject": subject?.color ?? "#f2b53a" } as CSSProperties;

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setIsOver(false);
    if (actions.draggingId && !tags.some((tag) => tag.id === actions.draggingId)) {
      actions.onMoveHere(subjectId);
    }
  }

  async function submitDraft() {
    const name = draft.trim();
    if (name && (await actions.onCreate(name, subjectId))) setDraft("");
  }

  return (
    <section
      aria-label={subject ? subject.name : "ממתינות לשיבוץ"}
      style={accent}
      onDragOver={(event) => {
        if (!actions.draggingId) return;
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`flex min-h-56 flex-col gap-2.5 rounded-xl border p-3 transition-colors ${
        subject ? "border-surface-border bg-white/[0.03]" : "border-dashed border-[var(--subject)]/50 bg-[var(--subject)]/[0.06]"
      } ${isOver ? "border-[var(--subject)] bg-[var(--subject)]/10" : ""}`}
    >
      <header className="flex items-center gap-2">
        {subject ? <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-[var(--subject)]" /> : null}
        <h3 className="min-w-0 flex-1 text-sm font-extrabold leading-tight">{subject ? subject.name : "ממתינות לשיבוץ"}</h3>
        <span className="text-xs tabular-nums text-text-muted">{tags.length}</span>
        {onEdit ? (
          <button type="button" onClick={onEdit} aria-label={`עריכת ${subject?.name}`} className={iconButton}>
            <PencilIcon />
          </button>
        ) : null}
      </header>

      {subject ? (
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <button
            type="button"
            role="switch"
            aria-checked={subject.onHomepage}
            onClick={onToggleHomepage}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md py-1 pe-1.5 hover:text-white"
          >
            <span
              aria-hidden="true"
              className={`relative h-4 w-7 rounded-full transition-colors ${subject.onHomepage ? "bg-accent" : "bg-white/20"}`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-bg-start transition-[inset-inline-start] ${
                  subject.onHomepage ? "start-[0.85rem]" : "start-0.5"
                }`}
              />
            </span>
            בעמוד הבית
          </button>
          <span className="ms-auto flex">
            <button type="button" disabled={isFirst} onClick={() => onReorder?.(-1)} aria-label="הקדמה" className={iconButton}>
              <ChevronRightIcon />
            </button>
            <button type="button" disabled={isLast} onClick={() => onReorder?.(1)} aria-label="הזזה אחורה" className={iconButton}>
              <ChevronLeftIcon />
            </button>
          </span>
        </div>
      ) : (
        <p className="text-xs text-text-muted">תגיות חדשות שעדיין לא שובצו בנושא</p>
      )}

      <ul className="flex flex-col gap-1.5">
        {tags.map((tag) => (
          <li key={tag.id}>
            <button
              type="button"
              draggable
              aria-pressed={actions.selectedId === tag.id}
              onClick={() => actions.onSelect(tag.id)}
              onDragStart={() => actions.onDragStart(tag.id)}
              onDragEnd={actions.onDragEnd}
              className={`flex w-full cursor-grab items-center gap-2 rounded-lg border px-2.5 py-1.5 text-start text-sm transition-colors active:cursor-grabbing ${
                actions.selectedId === tag.id
                  ? "border-accent bg-accent/15"
                  : "border-surface-border bg-surface hover:border-white/30"
              } ${actions.draggingId === tag.id ? "opacity-40" : ""}`}
            >
              <span className="min-w-0 flex-1 truncate">{tag.name}</span>
              <span className="text-xs tabular-nums text-text-muted">{tag.articleCount}</span>
            </button>
          </li>
        ))}
        {tags.length === 0 ? (
          <li className="rounded-lg border border-dashed border-surface-border p-3 text-center text-xs text-text-muted">
            {subject ? "אין עדיין תגיות" : "אין תגיות שממתינות"}
          </li>
        ) : null}
      </ul>

      {selectedElsewhere ? (
        <button
          type="button"
          onClick={() => actions.onMoveHere(subjectId)}
          className="rounded-lg bg-[var(--subject)] px-2 py-1.5 text-xs font-bold text-bg-start"
        >
          העברה לכאן
        </button>
      ) : null}

      <form
        className="mt-auto flex items-center gap-1.5"
        onSubmit={(event) => {
          event.preventDefault();
          void submitDraft();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="תגית חדשה"
          aria-label={`תגית חדשה ב${subject ? subject.name : "תיבת ההמתנה"}`}
          className="min-w-0 flex-1 rounded-lg border border-surface-border bg-transparent px-2.5 py-1.5 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button type="submit" aria-label="הוספה" className={iconButton}>
          <PlusIcon />
        </button>
      </form>
    </section>
  );
}
