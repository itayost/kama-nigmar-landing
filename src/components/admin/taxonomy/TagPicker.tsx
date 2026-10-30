"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { createTag } from "@/lib/actions/taxonomy";
import type { AdminSubject, TaxonomyTag } from "@/lib/dal/taxonomy-admin";
import { INBOX_COLOR, INBOX_LABEL } from "@/lib/taxonomy/inbox";
import { inputClass } from "../Field";
import { CloseIcon } from "../icons";

interface TagPickerProps {
  readonly subjects: readonly AdminSubject[];
  readonly catalog: readonly TaxonomyTag[];
  readonly value: readonly string[];
  onChange(ids: string[]): void;
  onCreated(tag: TaxonomyTag): void;
}

type ColorOf = (subjectId: string | null) => string;

// Picks tags grouped by subject. A name that does not exist yet can be
// created on the spot, inside a subject or in the inbox.
export function TagPicker({ subjects, catalog, value, onChange, onCreated }: TagPickerProps) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const colors = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject.color])), [subjects]);
  const colorOf: ColorOf = (subjectId) => (subjectId ? colors.get(subjectId) : undefined) ?? INBOX_COLOR;
  const byId = useMemo(() => new Map(catalog.map((tag) => [tag.id, tag])), [catalog]);
  const exact = catalog.find((tag) => tag.name === trimmed);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((existing) => existing !== id) : [...value, id]);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <SelectedChips tags={value.flatMap((id) => byId.get(id) ?? [])} colorOf={colorOf} onRemove={toggle} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || !exact) return;
          event.preventDefault();
          toggle(exact.id);
          setQuery("");
        }}
        placeholder="חיפוש תגית או יצירת חדשה"
        aria-label="חיפוש תגית"
        className={inputClass}
      />
      {trimmed && !exact ? (
        <CreateTagPrompt
          key={trimmed}
          name={trimmed}
          subjects={subjects}
          onCreated={(tag) => {
            onCreated(tag);
            onChange([...value, tag.id]);
            setQuery("");
          }}
        />
      ) : null}
      <TagGroups subjects={subjects} catalog={catalog} query={trimmed} selected={value} colorOf={colorOf} onToggle={toggle} />
    </div>
  );
}

function SelectedChips({
  tags,
  colorOf,
  onRemove,
}: {
  readonly tags: readonly TaxonomyTag[];
  readonly colorOf: ColorOf;
  onRemove(id: string): void;
}) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="התגיות שנבחרו">
      {tags.map((tag) => (
        <li
          key={tag.id}
          style={{ "--subject": colorOf(tag.subjectId) } as CSSProperties}
          className="flex items-center gap-1.5 rounded-full border border-[var(--subject)]/55 bg-[var(--subject)]/15 py-1 ps-3 pe-1 text-sm"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--subject)]" />
          {tag.name}
          <button
            type="button"
            onClick={() => onRemove(tag.id)}
            aria-label={`הסרת ${tag.name}`}
            className="grid h-5 w-5 place-items-center rounded-full bg-white/10 hover:bg-red-400/30"
          >
            <CloseIcon width={12} height={12} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function CreateTagPrompt({
  name,
  subjects,
  onCreated,
}: {
  readonly name: string;
  readonly subjects: readonly AdminSubject[];
  onCreated(tag: TaxonomyTag): void;
}) {
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function create() {
    setIsCreating(true);
    const result = await createTag(name, subjectId || null);
    setIsCreating(false);
    if (result.tag) onCreated(result.tag);
    else setError(result.error ?? "יצירת התגית נכשלה");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm">
        <span>
          יצירת התגית <b>״{name}״</b> בנושא
        </span>
        <select
          value={subjectId}
          onChange={(event) => setSubjectId(event.target.value)}
          aria-label="נושא לתגית החדשה"
          className="rounded-md border border-surface-border bg-bg-start px-2 py-1"
        >
          <option value="">ללא נושא (לתיבת ההמתנה)</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={isCreating}
          onClick={() => void create()}
          className="rounded-md bg-accent px-3 py-1 font-bold text-bg-start disabled:opacity-50"
        >
          {isCreating ? "יוצר..." : "הוספה"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

function TagGroups({
  subjects,
  catalog,
  query,
  selected,
  colorOf,
  onToggle,
}: {
  readonly subjects: readonly AdminSubject[];
  readonly catalog: readonly TaxonomyTag[];
  readonly query: string;
  readonly selected: readonly string[];
  readonly colorOf: ColorOf;
  onToggle(id: string): void;
}) {
  const picked = new Set(selected);
  const matching = catalog.filter((tag) => !query || tag.name.includes(query));
  const groups = [...subjects.map(({ id, name }) => ({ id, name })), { id: null, name: INBOX_LABEL }]
    .map((group) => ({ ...group, tags: matching.filter((tag) => tag.subjectId === group.id) }))
    .filter((group) => group.tags.length > 0);

  return (
    <div className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-lg border border-surface-border bg-black/15 p-3">
      {groups.map((group) => (
        <div key={group.id ?? "inbox"} className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: colorOf(group.id) }} />
            {group.name}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {group.tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                aria-pressed={picked.has(tag.id)}
                onClick={() => onToggle(tag.id)}
                style={{ "--subject": colorOf(tag.subjectId) } as CSSProperties}
                className="rounded-full border border-surface-border px-2.5 py-0.5 text-xs text-text-muted transition-colors hover:border-[var(--subject)]/60 hover:text-white aria-pressed:border-[var(--subject)] aria-pressed:bg-[var(--subject)]/25 aria-pressed:font-bold aria-pressed:text-white"
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      ))}
      {groups.length === 0 ? <p className="text-xs text-text-muted">אין תגיות שמתאימות לחיפוש</p> : null}
    </div>
  );
}
