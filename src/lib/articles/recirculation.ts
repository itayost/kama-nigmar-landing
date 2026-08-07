export interface RecircInput {
  readonly id: string;
  readonly tags: readonly string[];
  readonly publishedAt: Date | null;
}

export interface RecircCurrent {
  readonly id: string;
  readonly tags: readonly string[];
  readonly blockCount: number;
}

export interface RecirculationPlan<T> {
  readonly midArticle: readonly T[];
  readonly related: readonly T[];
  readonly trending: readonly T[];
}

export interface PlanOptions {
  readonly midCount: number;
  readonly relatedCount: number;
  readonly trendingCount: number;
  readonly minBlocksForMid: number;
}

const DEFAULT_OPTIONS: PlanOptions = {
  midCount: 2,
  relatedCount: 3,
  trendingCount: 3,
  minBlocksForMid: 4,
};

function publishedTime(candidate: RecircInput): number {
  return candidate.publishedAt?.getTime() ?? 0;
}

// The single planner for all recirculation placements. Allocation order is
// mid -> related -> trending, deduped globally, so an Article never appears
// twice on the same page.
// - Mid-article is same-topic ONLY (no fill): a random article mid-read
//   would feel broken; the end rows are where fill is acceptable.
// - Relevance = tag overlap, then trailing-7-day views, then recency.
// - Trending = 7-day views only; hidden entirely when nothing has views.
export function planRecirculation<T extends RecircInput>(
  current: RecircCurrent,
  candidates: readonly T[],
  weeklyViews: Readonly<Record<string, number>>,
  options: Partial<PlanOptions> = {},
): RecirculationPlan<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const weekly = (candidate: T) => weeklyViews[candidate.id] ?? 0;
  const others = candidates.filter((candidate) => candidate.id !== current.id);
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
        weekly(b.candidate) - weekly(a.candidate) ||
        publishedTime(b.candidate) - publishedTime(a.candidate),
    )
    .map((entry) => entry.candidate);

  const midArticle =
    current.blockCount >= opts.minBlocksForMid
      ? byRelevance.slice(0, opts.midCount)
      : [];
  const taken = new Set(midArticle.map((candidate) => candidate.id));

  const relatedScored = byRelevance
    .filter((candidate) => !taken.has(candidate.id))
    .slice(0, opts.relatedCount);
  const relatedFill = others
    .filter(
      (candidate) =>
        !taken.has(candidate.id) &&
        !relatedScored.some((picked) => picked.id === candidate.id),
    )
    .sort((a, b) => publishedTime(b) - publishedTime(a))
    .slice(0, opts.relatedCount - relatedScored.length);
  const related = [...relatedScored, ...relatedFill];
  for (const candidate of related) taken.add(candidate.id);

  const trending = others
    .filter((candidate) => !taken.has(candidate.id) && weekly(candidate) > 0)
    .sort((a, b) => weekly(b) - weekly(a) || publishedTime(b) - publishedTime(a))
    .slice(0, opts.trendingCount);

  return { midArticle, related, trending };
}

// Trending in isolation (articles index strip): 7-day views only.
export function rankTrending<T extends RecircInput>(
  candidates: readonly T[],
  weeklyViews: Readonly<Record<string, number>>,
  limit: number,
): T[] {
  const weekly = (candidate: T) => weeklyViews[candidate.id] ?? 0;
  return candidates
    .filter((candidate) => weekly(candidate) > 0)
    .sort((a, b) => weekly(b) - weekly(a) || publishedTime(b) - publishedTime(a))
    .slice(0, limit);
}
