"use client";

import type { CSSProperties } from "react";
import type { AdminSubject } from "@/lib/dal/taxonomy-admin";
import { ARTICLE_FORMATS, FORMAT_LABELS, type ArticleFormat } from "@/lib/taxonomy/format";
import { otherSubjects } from "@/lib/taxonomy/suggest";

interface SubjectChoiceProps {
  readonly subjects: readonly AdminSubject[];
  readonly tagSubjects: readonly (string | null)[];
  readonly primarySubjectId: string | null;
  readonly isSuggested: boolean;
  readonly format: ArticleFormat;
  onPrimaryChange(subjectId: string | null): void;
  onUseSuggestion(): void;
  onFormatChange(format: ArticleFormat): void;
}

// Format and primary subject, with the label the article will carry and the
// other subjects it will also appear in.
export function SubjectChoice({
  subjects,
  tagSubjects,
  primarySubjectId,
  isSuggested,
  format,
  onPrimaryChange,
  onUseSuggestion,
  onFormatChange,
}: SubjectChoiceProps) {
  const primary = subjects.find((subject) => subject.id === primarySubjectId) ?? null;
  const others = otherSubjects(tagSubjects, primarySubjectId)
    .map((id) => subjects.find((subject) => subject.id === id))
    .filter((subject): subject is AdminSubject => subject !== undefined);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface p-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">סוג</legend>
        <div className="inline-flex self-start overflow-hidden rounded-lg border border-surface-border">
          {ARTICLE_FORMATS.map((option) => (
            <label
              key={option}
              className="cursor-pointer border-s border-surface-border px-4 py-1.5 text-sm text-text-muted first:border-s-0 has-[:checked]:bg-accent has-[:checked]:font-bold has-[:checked]:text-bg-start has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
            >
              <input
                type="radio"
                name="format"
                value={option}
                checked={format === option}
                onChange={() => onFormatChange(option)}
                className="sr-only"
              />
              {FORMAT_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="primarySubjectId" className="text-sm font-medium">
            נושא ראשי
          </label>
          <select
            id="primarySubjectId"
            name="primarySubjectId"
            value={primarySubjectId ?? ""}
            onChange={(event) => onPrimaryChange(event.target.value || null)}
            className="rounded-lg border border-surface-border bg-bg-start px-3 py-1.5 text-sm"
          >
            <option value="">ללא נושא ראשי</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {isSuggested ? (
            <span className="text-xs font-bold text-accent">הוצע לפי התגיות</span>
          ) : (
            <button type="button" onClick={onUseSuggestion} className="text-xs text-text-muted underline-offset-4 hover:text-white hover:underline">
              נבחר ידנית · חזרה להצעה
            </button>
          )}
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
          {others.length > 0 ? (
            <>
              הכתבה תופיע גם ב:
              {others.map((subject) => (
                <span key={subject.id} className="flex items-center gap-1.5 text-white">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                  {subject.name}
                </span>
              ))}
            </>
          ) : primary ? (
            "הכתבה תופיע רק בנושא הזה."
          ) : (
            "בלי נושא ראשי, התווית מעל הכותרת תהיה סוג הכתבה."
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 border-t border-surface-border pt-3 text-xs text-text-muted">
        כך זה ייראה:
        <span
          style={{ "--subject": primary?.color ?? "#ffffff" } as CSSProperties}
          className="rounded-md bg-[var(--subject)] px-2 py-0.5 font-extrabold text-bg-start"
        >
          {primary ? primary.name : FORMAT_LABELS[format]}
        </span>
      </div>
    </div>
  );
}
