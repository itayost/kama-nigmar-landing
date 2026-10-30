"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteSubject, saveSubject, type ActionResult } from "@/lib/actions/taxonomy";
import type { AdminSubject } from "@/lib/dal/taxonomy-admin";
import { inputClass } from "../Field";

const initialState: ActionResult = {};
const DEFAULT_COLOR = "#4cb8ff";

interface SubjectFormProps {
  readonly subject?: AdminSubject;
  readonly onDone: () => void;
}

// Create or edit a subject. Deleting moves its tags to the inbox and leaves
// its articles without a primary subject, so it asks first.
export function SubjectForm({ subject, onDone }: SubjectFormProps) {
  const [name, setName] = useState(subject?.name ?? "");
  const [slug, setSlug] = useState(subject?.slug ?? "");
  const [color, setColor] = useState(subject?.color ?? DEFAULT_COLOR);
  const [description, setDescription] = useState(subject?.description ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const [state, formAction, isPending] = useActionState(async (prev: ActionResult, formData: FormData) => {
    const result = await saveSubject(prev, formData);
    if (!result.error) onDone();
    return result;
  }, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-accent/40 bg-surface p-4"
      aria-label={subject ? `עריכת הנושא ${subject.name}` : "נושא חדש"}
    >
      {subject ? <input type="hidden" name="id" value={subject.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">שם</span>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="כדורגל ישראלי"
            className={inputClass}
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">כתובת באנגלית</span>
          <input
            name="slug"
            dir="ltr"
            value={slug}
            onChange={(event) => setSlug(event.target.value.toLowerCase())}
            placeholder="israeli-football"
            className={`${inputClass} text-left`}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">צבע</span>
          <input
            type="color"
            name="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-10 w-16 cursor-pointer rounded-lg border border-surface-border bg-surface p-1"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">משפט תיאור</span>
        <input
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="ליגת העל, הנבחרת והקבוצות שלנו באירופה"
          className={inputClass}
        />
      </label>
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-bg-start disabled:opacity-50"
        >
          {isPending ? "שומר..." : subject ? "שמירה" : "הוספת נושא"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-surface-border px-4 py-2 text-sm text-text-muted hover:text-white"
        >
          ביטול
        </button>
        {subject && !confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="ms-auto rounded-lg px-3 py-2 text-sm text-text-muted hover:text-red-400"
          >
            מחיקת הנושא
          </button>
        ) : null}
        {subject && confirmDelete ? (
          <span className="ms-auto flex flex-wrap items-center gap-2 text-sm">
            <span className="text-red-400">התגיות יעברו לתיבת ההמתנה. למחוק?</span>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() =>
                startDelete(async () => {
                  await deleteSubject(subject.id);
                  onDone();
                })
              }
              className="rounded-lg bg-red-500/90 px-3 py-1.5 font-medium text-white hover:bg-red-500 disabled:opacity-50"
            >
              מחיקה
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-surface-border px-3 py-1.5 text-text-muted"
            >
              לא
            </button>
          </span>
        ) : null}
      </div>
    </form>
  );
}
