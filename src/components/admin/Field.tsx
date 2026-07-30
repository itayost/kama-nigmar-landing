import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-white placeholder:text-text-muted focus:border-accent focus:outline-none";

interface FieldProps {
  readonly label: string;
  readonly required?: boolean;
  readonly error?: string;
  readonly hint?: string;
  // Set for children that are not a single input (radio groups, uploaders,
  // chip inputs) - nesting those inside a <label> is invalid HTML and gives
  // inner controls a wrong accessible name.
  readonly group?: boolean;
  readonly children: ReactNode;
}

export function Field({ label, required, error, hint, group, children }: FieldProps) {
  const labelText = (
    <span className="text-sm font-medium">
      {label}
      {required ? <span className="text-accent"> *</span> : null}
    </span>
  );

  return (
    <div className="flex flex-col gap-1.5">
      {group ? (
        <div role="group" aria-label={label} className="flex flex-col gap-1.5">
          {labelText}
          {children}
        </div>
      ) : (
        <label className="flex flex-col gap-1.5">
          {labelText}
          {children}
        </label>
      )}
      {hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
