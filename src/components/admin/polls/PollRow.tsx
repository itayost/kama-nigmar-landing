"use client";

import { useState } from "react";
import { activatePoll, closePoll, deletePoll, setMainPoll } from "@/lib/actions/polls";
import type { PollOption } from "@/lib/polls/schema";

interface PollRowProps {
  readonly id: string;
  readonly question: string;
  readonly options: readonly PollOption[];
  readonly status: "draft" | "active" | "closed";
  readonly isMain: boolean;
  readonly linkedArticleCount: number;
  readonly votes: Readonly<Record<string, number>>;
  readonly totalVotes: number;
}

const STATUS_LABELS = { draft: "טיוטה", active: "פעיל", closed: "סגור" } as const;

const actionButtonClass =
  "whitespace-nowrap rounded-md border border-surface-border px-3 py-1.5 text-sm transition-colors hover:border-accent/50";

export function PollRow({
  id,
  question,
  options,
  status,
  isMain,
  linkedArticleCount,
  votes,
  totalVotes,
}: PollRowProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold">{question}</span>
        <span
          className={
            status === "active"
              ? "rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
              : "rounded-full border border-surface-border bg-surface px-2.5 py-0.5 text-xs font-medium text-text-muted"
          }
        >
          {STATUS_LABELS[status]}
        </span>
        {isMain ? (
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            ראשי
          </span>
        ) : null}
        <span className="text-sm text-text-muted">
          {totalVotes === 1 ? "הצבעה אחת" : `${totalVotes} הצבעות`}
        </span>
        {linkedArticleCount > 0 ? (
          <span className="text-sm text-text-muted">
            {linkedArticleCount === 1
              ? "מקושר לכתבה אחת"
              : `מקושר ל־${linkedArticleCount} כתבות`}
          </span>
        ) : null}
      </div>
      <ul className="flex flex-col gap-1 text-sm text-text-muted">
        {options.map((option) => (
          <li key={option.id} className="flex justify-between">
            <span>{option.label}</span>
            <span className="font-mono text-xs">{votes[option.id] ?? 0}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        {status !== "active" ? (
          <form action={activatePoll}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={actionButtonClass}>
              הפעלה
            </button>
          </form>
        ) : (
          <form action={closePoll}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={actionButtonClass}>
              סגירה
            </button>
          </form>
        )}
        {status === "active" && !isMain ? (
          <form action={setMainPoll}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={actionButtonClass}>
              הצגה בעמוד הבית
            </button>
          </form>
        ) : null}
        {isConfirmingDelete ? (
          <>
            <span className="text-sm text-red-400">למחוק? כולל ההצבעות</span>
            <form action={deletePoll}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="whitespace-nowrap rounded-md bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
              >
                מחיקה
              </button>
            </form>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className={`${actionButtonClass} text-text-muted`}
            >
              ביטול
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="whitespace-nowrap rounded-md border border-surface-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-red-400/50 hover:text-red-400"
          >
            מחיקה
          </button>
        )}
      </div>
    </li>
  );
}
