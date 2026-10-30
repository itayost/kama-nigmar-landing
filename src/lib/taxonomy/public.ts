import type { ArticleFormat } from "./format";

// How the public site arranges articles by subject. Pure: the DAL feeds it
// subjects, tag links and articles, newest first.

export interface SubjectSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly color: string;
  readonly description: string | null;
  readonly position: number;
  readonly onHomepage: boolean;
}

export interface TagSummary {
  readonly id: string;
  readonly name: string;
  readonly subjectId: string | null;
}

export interface TaxonomyFields {
  readonly subject: SubjectSummary | null;
  // In the order the article shows them.
  readonly tagList: readonly TagSummary[];
  // The primary subject first, then the rest by position.
  readonly subjectIds: readonly string[];
  // Subjects the article also appears in, besides its primary one.
  readonly alsoIn: readonly SubjectSummary[];
}

export type WithTaxonomy<T> = T & TaxonomyFields;

interface Taxable {
  readonly id: string;
  readonly primarySubjectId: string | null;
}

export function withTaxonomy<T extends Taxable>(
  article: T,
  subjects: ReadonlyMap<string, SubjectSummary>,
  tagsByArticle: ReadonlyMap<string, readonly TagSummary[]>,
): WithTaxonomy<T> {
  const subject = article.primarySubjectId ? (subjects.get(article.primarySubjectId) ?? null) : null;
  const tagList = tagsByArticle.get(article.id) ?? [];
  const alsoIn = [...new Set(tagList.flatMap((tag) => (tag.subjectId ? [tag.subjectId] : [])))]
    .filter((id) => id !== subject?.id)
    .flatMap((id) => subjects.get(id) ?? [])
    .sort((a, b) => a.position - b.position);
  return {
    ...article,
    subject,
    tagList,
    subjectIds: [...(subject ? [subject.id] : []), ...alsoIn.map((other) => other.id)],
    alsoIn,
  };
}

type Listed = TaxonomyFields & { readonly id: string; readonly format: ArticleFormat };

export interface HomeSection<T> {
  readonly subject: SubjectSummary;
  // Full: a card grid. Compact: one row, for a subject with few stories.
  readonly variant: "full" | "compact";
  readonly articles: readonly T[];
  // Every published article in the subject, for the "all N" link.
  readonly total: number;
}

export interface HomepagePlan<T> {
  readonly lead: T | null;
  readonly sections: readonly HomeSection<T>[];
  readonly roundups: readonly T[];
}

const FULL_SECTION_MIN = 3;
const FULL_SECTION_MAX = 5;
const ROUNDUPS_SHOWN = 3;

// No article appears twice: the lead is skipped by every section, a story
// appears only in its primary subject's section, and roundups have their
// own strip.
export function planHomepage<T extends Listed>(articles: readonly T[], subjects: readonly SubjectSummary[]): HomepagePlan<T> {
  const lead = articles.find((article) => article.format !== "roundup") ?? null;
  const rest = articles.filter((article) => article !== lead);
  const sections = [...subjects]
    .filter((subject) => subject.onHomepage)
    .sort((a, b) => a.position - b.position)
    .flatMap((subject): HomeSection<T>[] => {
      const stories = rest.filter((article) => article.format !== "roundup" && article.subject?.id === subject.id);
      if (stories.length === 0) return [];
      const full = stories.length >= FULL_SECTION_MIN;
      return [
        {
          subject,
          variant: full ? "full" : "compact",
          articles: stories.slice(0, full ? FULL_SECTION_MAX : 1),
          total: articles.filter((article) => article.subjectIds.includes(subject.id)).length,
        },
      ];
    });
  return { lead, sections, roundups: rest.filter((article) => article.format === "roundup").slice(0, ROUNDUPS_SHOWN) };
}

export interface RailTag {
  readonly name: string;
  readonly count: number;
}

export interface SubjectPagePlan<T> {
  readonly lead: T | null;
  readonly rail: readonly RailTag[];
  readonly activeTag: string | null;
  readonly items: readonly T[];
  readonly hasMore: boolean;
  readonly total: number;
}

function railFor(members: readonly Listed[], subjectId: string): RailTag[] {
  const counts = new Map<string, number>();
  for (const article of members) {
    for (const tag of article.tagList) {
      if (tag.subjectId === subjectId) counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "he"));
}

// The subject's newest story leads; the rest list below it, filterable by the
// subject's own tags. A filter that matches the lead brings it into the list.
export function planSubjectPage<T extends Listed>(
  articles: readonly T[],
  subject: SubjectSummary,
  options: { readonly tag?: string; readonly limit: number },
): SubjectPagePlan<T> {
  const members = articles.filter((article) => article.subjectIds.includes(subject.id));
  const lead =
    members.find((article) => article.subject?.id === subject.id && article.format !== "roundup") ?? members[0] ?? null;
  const rail = railFor(members, subject.id);
  const activeTag = options.tag && rail.some((entry) => entry.name === options.tag) ? options.tag : null;
  const listed = activeTag
    ? members.filter((article) => article.tagList.some((tag) => tag.name === activeTag))
    : members.filter((article) => article !== lead);
  return {
    lead,
    rail,
    activeTag,
    items: listed.slice(0, options.limit),
    hasMore: listed.length > options.limit,
    total: members.length,
  };
}
