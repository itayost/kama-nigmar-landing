"use client";

import { useActionState, useState } from "react";
import { createPoll, type PollFormState } from "@/lib/actions/polls";
import { inputClass } from "../Field";

const initialState: PollFormState = {};
const MAX_OPTIONS = 4;

export function NewPollForm() {
  const [question, setQuestion] = useState("");
  const [optionLabels, setOptionLabels] = useState<string[]>(["", ""]);
  const [state, formAction, isPending] = useActionState(
    async (prev: PollFormState, formData: FormData) => {
      const result = await createPoll(prev, formData);
      if (!result.error) {
        setQuestion("");
        setOptionLabels(["", ""]);
      }
      return result;
    },
    initialState,
  );

  function updateOption(index: number, value: string) {
    setOptionLabels(optionLabels.map((label, i) => (i === index ? value : label)));
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-4"
    >
      <span className="text-sm font-bold">סקר חדש</span>
      <input
        type="text"
        name="question"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="השאלה (למשל: מי לוקח את הדרבי הערב?)"
        className={inputClass}
      />
      {optionLabels.map((label, index) => (
        <input
          key={index}
          type="text"
          name="option"
          value={label}
          onChange={(event) => updateOption(index, event.target.value)}
          placeholder={`תשובה ${index + 1}`}
          className={inputClass}
        />
      ))}
      <div className="flex items-center gap-2">
        {optionLabels.length < MAX_OPTIONS ? (
          <button
            type="button"
            onClick={() => setOptionLabels([...optionLabels, ""])}
            className="rounded-md border border-surface-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-accent/50 hover:text-white"
          >
            + תשובה נוספת
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-bold text-bg-start transition-all hover:shadow-[0_0_20px_rgba(46,204,64,0.4)] disabled:opacity-50"
        >
          {isPending ? "יוצר..." : "יצירת סקר"}
        </button>
      </div>
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
    </form>
  );
}
