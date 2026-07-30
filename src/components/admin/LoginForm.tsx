"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/lib/actions/auth";
import { Field, inputClass } from "./Field";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  // Controlled so React 19's automatic form reset does not clear the email
  // after a failed attempt. The password stays uncontrolled: clearing it on
  // failure is the expected behavior.
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="אימייל">
        <input
          type="email"
          name="email"
          dir="ltr"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${inputClass} text-left`}
        />
      </Field>
      <Field label="סיסמה">
        <input
          type="password"
          name="password"
          dir="ltr"
          autoComplete="current-password"
          className={`${inputClass} text-left`}
        />
      </Field>
      {state.error ? (
        <p className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-accent px-6 py-2.5 font-medium text-bg-start transition-all hover:shadow-[0_0_20px_rgba(46,204,64,0.4)] disabled:opacity-50"
      >
        {isPending ? "נכנס..." : "כניסה"}
      </button>
    </form>
  );
}
