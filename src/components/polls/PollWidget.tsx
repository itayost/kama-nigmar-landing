"use client";

import { useEffect, useState } from "react";
import type { PollOption, PollResults } from "@/lib/polls/schema";

interface StoredVote {
  readonly optionId: string;
  readonly results: PollResults;
}

interface PollWidgetProps {
  readonly pollId: string;
  readonly question: string;
  readonly options: readonly PollOption[];
}

function storageKey(pollId: string): string {
  return `poll-vote-${pollId}`;
}

function readStoredVote(pollId: string): StoredVote | null {
  try {
    const raw = localStorage.getItem(storageKey(pollId));
    return raw ? (JSON.parse(raw) as StoredVote) : null;
  } catch {
    return null;
  }
}

interface WidgetState {
  readonly isReady: boolean;
  readonly vote: StoredVote | null;
}

export function PollWidget({ pollId, question, options }: PollWidgetProps) {
  const [{ isReady, vote }, setState] = useState<WidgetState>({
    isReady: false,
    vote: null,
  });
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    // localStorage exists only on the client; reading it after hydration is
    // the standard mismatch-safe pattern for client-only persisted state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ isReady: true, vote: readStoredVote(pollId) });
  }, [pollId]);

  async function handleVote(optionId: string) {
    if (isVoting || vote) return;
    setIsVoting(true);
    try {
      const response = await fetch("/api/polls/vote", {
        method: "POST",
        body: JSON.stringify({ pollId, optionId }),
      });
      if (!response.ok) return;
      const results = (await response.json()) as PollResults;
      const stored: StoredVote = { optionId, results };
      setState({ isReady: true, vote: stored });
      try {
        localStorage.setItem(storageKey(pollId), JSON.stringify(stored));
      } catch {
        // Private mode without storage: the in-memory state still shows results.
      }
    } catch {
      // Network hiccup: leave the options clickable.
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface p-5">
      <p className="mb-1 flex items-center gap-2 text-xs font-bold text-accent">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-[3px] bg-accent shadow-[0_0_10px_rgba(46,204,64,0.6)]"
        />
        הסקר היומי
      </p>
      <h2 className="mb-4 text-lg font-bold">{question}</h2>

      {!isReady ? (
        <div className="h-24" aria-hidden="true" />
      ) : vote ? (
        <div className="flex flex-col gap-2.5">
          {options.map((option) => {
            const count =
              vote.results.results.find((r) => r.optionId === option.id)?.count ?? 0;
            const percent =
              vote.results.total > 0
                ? Math.round((count / vote.results.total) * 100)
                : 0;
            const isMine = option.id === vote.optionId;
            return (
              <div key={option.id} className="relative overflow-hidden rounded-lg border border-surface-border">
                <div
                  aria-hidden="true"
                  className={`absolute inset-y-0 right-0 ${isMine ? "bg-accent/25" : "bg-white/5"}`}
                  style={{ width: `${percent}%` }}
                />
                <div className="relative flex items-center justify-between px-3.5 py-2 text-sm">
                  <span className={isMine ? "font-bold" : undefined}>
                    {option.label}
                    {isMine ? " ✓" : ""}
                  </span>
                  <span className="font-mono text-xs text-text-muted">{percent}%</span>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-text-muted">
            {vote.results.total === 1 ? "הצבעה אחת" : `${vote.results.total} הצבעות`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={isVoting}
              onClick={() => handleVote(option.id)}
              data-ph-event="poll_vote"
              data-ph-slug={option.id}
              className="rounded-lg border border-surface-border px-3.5 py-2 text-start text-sm transition-colors hover:border-accent/50 hover:bg-accent/5 disabled:opacity-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
