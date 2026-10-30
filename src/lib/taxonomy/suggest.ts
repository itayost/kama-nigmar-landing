import type { ArticleFormat } from "./format";

// The article form suggests a primary subject from the picked tags, in the
// same way the backfill chose one. `tagSubjects` holds each picked tag's
// subject in tag order; null for a tag still in the inbox.

function counted(tagSubjects: readonly (string | null)[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const subject of tagSubjects) {
    if (subject) counts.set(subject, (counts.get(subject) ?? 0) + 1);
  }
  return counts;
}

export function suggestPrimarySubject(
  tagSubjects: readonly (string | null)[],
  format: ArticleFormat,
): string | null {
  const counts = counted(tagSubjects);
  if (format === "roundup") return counts.size === 1 ? [...counts.keys()][0] : null;
  let best: string | null = null;
  // Map keeps first-seen order, so a tie goes to the first tag's subject.
  for (const [subject, count] of counts) {
    if (best === null || count > (counts.get(best) ?? 0)) best = subject;
  }
  return best;
}

export function otherSubjects(
  tagSubjects: readonly (string | null)[],
  primarySubject: string | null,
): string[] {
  return [...counted(tagSubjects).keys()].filter((subject) => subject !== primarySubject);
}
