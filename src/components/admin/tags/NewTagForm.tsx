"use client";

import { useActionState, useState } from "react";
import { createTag, type TagFormState } from "@/lib/actions/tags";
import { inputClass } from "../Field";

const initialState: TagFormState = {};

export function NewTagForm() {
  const [name, setName] = useState("");
  const [state, formAction, isPending] = useActionState(
    async (prev: TagFormState, formData: FormData) => {
      const result = await createTag(prev, formData);
      if (!result.error) {
        setName("");
      }
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="שם התגית החדשה (למשל: כדורסל)"
          className={`${inputClass} max-w-xs`}
        />
        <button
          type="submit"
          disabled={isPending}
          className="whitespace-nowrap rounded-lg bg-accent px-4 py-2 text-sm font-bold text-bg-start transition-all hover:shadow-[0_0_20px_rgba(46,204,64,0.4)] disabled:opacity-50"
        >
          {isPending ? "מוסיף..." : "+ הוספה"}
        </button>
      </div>
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
    </form>
  );
}
