"use client";

import { useActionState, useState } from "react";
import { deleteSubject, saveSubject, type ActionResult } from "@/lib/actions/taxonomy";
import type { AdminSubject } from "@/lib/dal/taxonomy-admin";
import { ConfirmDelete } from "../ConfirmDelete";
import { buttonClass, Field, inputClass } from "../Field";

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
        <Field label="שם">
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="כדורגל ישראלי"
            className={inputClass}
            autoFocus
          />
        </Field>
        <Field label="כתובת באנגלית">
          <input
            name="slug"
            dir="ltr"
            value={slug}
            onChange={(event) => setSlug(event.target.value.toLowerCase())}
            placeholder="israeli-football"
            className={`${inputClass} text-left`}
          />
        </Field>
        <Field label="צבע">
          <input
            type="color"
            name="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-10 w-16 cursor-pointer rounded-lg border border-surface-border bg-surface p-1"
          />
        </Field>
      </div>
      <Field label="משפט תיאור" error={state.error}>
        <input
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="ליגת העל, הנבחרת והקבוצות שלנו באירופה"
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-bg-start disabled:opacity-50"
        >
          {isPending ? "שומר..." : subject ? "שמירה" : "הוספת נושא"}
        </button>
        <button type="button" onClick={onDone} className={`${buttonClass} text-text-muted`}>
          ביטול
        </button>
        {subject ? (
          <span className="ms-auto">
            <ConfirmDelete
              question="התגיות יעברו לתיבת ההמתנה. למחוק?"
              triggerLabel="מחיקת הנושא"
              triggerClassName="text-sm text-text-muted transition-colors hover:text-red-400"
              onConfirm={async () => {
                await deleteSubject(subject.id);
                onDone();
              }}
            />
          </span>
        ) : null}
      </div>
    </form>
  );
}
