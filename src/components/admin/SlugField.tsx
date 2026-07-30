"use client";

import { Field, inputClass } from "./Field";

interface SlugFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly showPublishedWarning: boolean;
}

export function SlugField({
  value,
  onChange,
  error,
  showPublishedWarning,
}: SlugFieldProps) {
  const hint = showPublishedWarning
    ? "זהירות: שינוי הכתובת של כתבה שפורסמה ישבור קישורים שכבר שותפו"
    : "כתובת הכתבה באנגלית — מוצעת אוטומטית מהכותרת ואפשר לערוך";

  return (
    <Field label="כתובת (slug)" required error={error} hint={hint}>
      <input
        type="text"
        name="slug"
        dir="ltr"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="my-article-url"
        className={`${inputClass} text-left font-mono text-sm`}
      />
    </Field>
  );
}
