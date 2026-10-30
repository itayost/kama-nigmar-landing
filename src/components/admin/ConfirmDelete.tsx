"use client";

import { useState, useTransition } from "react";
import { buttonClass, dangerButtonClass } from "./Field";

interface ConfirmDeleteProps {
  // What the delete costs, shown next to the confirm button.
  readonly question: string;
  readonly triggerLabel?: string;
  readonly triggerClassName?: string;
  onConfirm(): Promise<unknown> | void;
}

const defaultTrigger = `${buttonClass} text-text-muted hover:border-red-400/50 hover:text-red-400`;

// A delete that asks once before acting.
export function ConfirmDelete({
  question,
  triggerLabel = "מחיקה",
  triggerClassName = defaultTrigger,
  onConfirm,
}: ConfirmDeleteProps) {
  const [isAsking, setIsAsking] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!isAsking) {
    return (
      <button type="button" onClick={() => setIsAsking(true)} className={triggerClassName}>
        {triggerLabel}
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-red-400">{question}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => void (await onConfirm()))}
        className={dangerButtonClass}
      >
        מחיקה
      </button>
      <button type="button" onClick={() => setIsAsking(false)} className={`${buttonClass} text-text-muted`}>
        ביטול
      </button>
    </span>
  );
}
