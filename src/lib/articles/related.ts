export interface RelatedInput {
  readonly slug: string;
  readonly tags: readonly string[];
  readonly views: number;
  readonly publishedAt: Date | null;
}

function publishedTime(candidate: RelatedInput): number {
  return candidate.publishedAt?.getTime() ?? 0;
}

// Relevance: shared-tag count first, then views, then recency.
// When tag overlap can't fill the list, top up with the newest articles so
// the section never runs short while there is content to show.
export function rankRelated<T extends RelatedInput>(
  current: Pick<RelatedInput, "slug" | "tags">,
  candidates: readonly T[],
  limit: number,
): T[] {
  const others = candidates.filter((candidate) => candidate.slug !== current.slug);
  const currentTags = new Set(current.tags);

  const byRelevance = others
    .map((candidate) => ({
      candidate,
      overlap: candidate.tags.filter((tag) => currentTags.has(tag)).length,
    }))
    .filter((entry) => entry.overlap > 0)
    .sort(
      (a, b) =>
        b.overlap - a.overlap ||
        b.candidate.views - a.candidate.views ||
        publishedTime(b.candidate) - publishedTime(a.candidate),
    )
    .map((entry) => entry.candidate);

  const picked = byRelevance.slice(0, limit);
  if (picked.length >= limit) return picked;

  const pickedSlugs = new Set(picked.map((candidate) => candidate.slug));
  const fill = others
    .filter((candidate) => !pickedSlugs.has(candidate.slug))
    .sort((a, b) => publishedTime(b) - publishedTime(a))
    .slice(0, limit - picked.length);

  return [...picked, ...fill];
}
