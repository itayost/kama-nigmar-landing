import type { ArticleFormat } from "./format";

// Pure planner for moving articles from the flat tag list to subjects,
// subject-owned tags and formats. It reads the old `articles.tags` vocabulary
// and never changes it, so it can be re-run until the new reads go live.

export interface SubjectSeed {
  readonly slug: string;
  readonly name: string;
  readonly position: number;
  readonly onHomepage: boolean;
  readonly color: string;
}

export type TagRule =
  // Dropped everywhere; any of `impliedBy` already says it.
  | { readonly kind: "retire"; readonly impliedBy: readonly string[] }
  // The tag becomes this subject; its articles take it as primary subject.
  | { readonly kind: "subject"; readonly subject: string }
  // The tag becomes the article's format.
  | { readonly kind: "format"; readonly format: ArticleFormat }
  // Stays a tag under `subject`; null leaves it in the admin's inbox.
  | { readonly kind: "tag"; readonly subject: string | null; readonly rename?: string };

export interface ArticleOverride {
  readonly primarySubject?: string | null;
  readonly format?: ArticleFormat;
}

export interface TaxonomyMapping {
  readonly subjects: readonly SubjectSeed[];
  readonly tags: Readonly<Record<string, TagRule>>;
  // Title keywords that set the format when no tag does; the first match wins.
  readonly formatKeywords?: readonly { readonly keyword: string; readonly format: ArticleFormat }[];
  readonly overrides?: Readonly<Record<number, ArticleOverride>>;
}

export interface BackfillArticle {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly tags: readonly string[];
}

export interface BackfillInput {
  readonly articles: readonly BackfillArticle[];
  readonly registry: readonly string[];
}

export type BackfillFlag =
  | "no-subject"
  | "no-primary"
  | "lost-coverage"
  | "inbox-tag"
  | "unmapped-tag";

export interface PlannedTag {
  readonly name: string;
  readonly subject: string | null;
}

export interface ArticlePlan {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly format: ArticleFormat;
  readonly primarySubject: string | null;
  readonly tags: readonly PlannedTag[];
  readonly subjects: readonly string[];
  readonly flags: readonly BackfillFlag[];
}

export interface TagChanges {
  readonly keep: readonly PlannedTag[];
  readonly renames: readonly { readonly from: string; readonly to: string }[];
  readonly inserts: readonly string[];
  readonly deletes: readonly string[];
}

export interface BackfillPlan {
  readonly subjects: readonly SubjectSeed[];
  readonly tags: TagChanges;
  readonly articles: readonly ArticlePlan[];
}

// A tag name resolved once: what it becomes, under which name and subject.
type Resolved =
  | Exclude<TagRule, { kind: "tag" }>
  | { readonly kind: "tag"; readonly final: string; readonly subject: string | null; readonly mapped: boolean };

type Resolver = (name: string) => Resolved;

function buildResolver(mapping: TaxonomyMapping): Resolver {
  // A tag's new name resolves like its old one, so re-running after the
  // registry was renamed plans the same result.
  const byFinalName = new Map<string, string | null>();
  for (const [name, rule] of Object.entries(mapping.tags)) {
    if (rule.kind === "tag") byFinalName.set(rule.rename ?? name, rule.subject);
  }
  return (name) => {
    const rule = Object.hasOwn(mapping.tags, name) ? mapping.tags[name] : undefined;
    if (rule && rule.kind !== "tag") return rule;
    if (rule) return { kind: "tag", final: rule.rename ?? name, subject: rule.subject, mapped: true };
    if (byFinalName.has(name)) {
      return { kind: "tag", final: name, subject: byFinalName.get(name) ?? null, mapped: true };
    }
    return { kind: "tag", final: name, subject: null, mapped: false };
  };
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

interface ClassifiedTags {
  readonly tags: PlannedTag[];
  readonly unmapped: Set<string>;
  readonly subjectTags: string[];
  readonly retiredImplied: (readonly string[])[];
  readonly format: ArticleFormat | null;
}

function classifyTags(names: readonly string[], resolve: Resolver): ClassifiedTags {
  const result: ClassifiedTags = {
    tags: [],
    unmapped: new Set(),
    subjectTags: [],
    retiredImplied: [],
    format: null,
  };
  let format: ArticleFormat | null = null;
  for (const name of names) {
    const rule = resolve(name);
    if (rule.kind === "retire") result.retiredImplied.push(rule.impliedBy);
    else if (rule.kind === "subject") result.subjectTags.push(rule.subject);
    else if (rule.kind === "format") format ??= rule.format;
    else if (!result.tags.some((tag) => tag.name === rule.final)) {
      result.tags.push({ name: rule.final, subject: rule.subject });
      if (!rule.mapped) result.unmapped.add(rule.final);
    }
  }
  return { ...result, format };
}

function formatFromTitle(title: string, mapping: TaxonomyMapping): ArticleFormat {
  return mapping.formatKeywords?.find(({ keyword }) => title.includes(keyword))?.format ?? "story";
}

function pickPrimary(
  classified: ClassifiedTags,
  format: ArticleFormat,
  tagSubjects: readonly string[],
  override: ArticleOverride | undefined,
): string | null {
  if (override && "primarySubject" in override) return override.primarySubject ?? null;
  if (classified.subjectTags.length > 0) return classified.subjectTags[0];
  if (format !== "roundup") return tagSubjects[0] ?? null;
  // A roundup only gets a primary subject when it clearly lives in one.
  const singleSubject = tagSubjects.length === 1 && classified.retiredImplied.length === 0;
  return singleSubject ? tagSubjects[0] : null;
}

function flagsFor(
  classified: ClassifiedTags,
  format: ArticleFormat,
  primarySubject: string | null,
  subjects: readonly string[],
): BackfillFlag[] {
  const lostCoverage =
    classified.retiredImplied.some((implied) => !implied.some((slug) => subjects.includes(slug))) ||
    classified.subjectTags.some((slug) => !subjects.includes(slug));
  const inbox = classified.tags.some(
    (tag) => tag.subject === null && !classified.unmapped.has(tag.name),
  );

  const flags: BackfillFlag[] = [];
  if (subjects.length === 0) flags.push("no-subject");
  if (primarySubject === null && format !== "roundup") flags.push("no-primary");
  if (lostCoverage) flags.push("lost-coverage");
  if (inbox) flags.push("inbox-tag");
  if (classified.unmapped.size > 0) flags.push("unmapped-tag");
  return flags;
}

function planArticle(
  article: BackfillArticle,
  mapping: TaxonomyMapping,
  resolve: Resolver,
  position: (slug: string) => number,
): ArticlePlan {
  const override = mapping.overrides?.[article.number];
  const classified = classifyTags(article.tags, resolve);
  const format = override?.format ?? classified.format ?? formatFromTitle(article.title, mapping);
  const tagSubjects = unique(classified.tags.flatMap((tag) => (tag.subject ? [tag.subject] : [])));
  const primarySubject = pickPrimary(classified, format, tagSubjects, override);
  const subjects = unique([...(primarySubject ? [primarySubject] : []), ...tagSubjects]).sort(
    (a, b) => position(a) - position(b),
  );

  return {
    id: article.id,
    number: article.number,
    title: article.title,
    format,
    primarySubject,
    tags: classified.tags,
    subjects,
    flags: flagsFor(classified, format, primarySubject, subjects),
  };
}

function planTags(
  input: BackfillInput,
  resolve: Resolver,
  position: (slug: string) => number,
): TagChanges {
  const inRegistry = new Set(input.registry);
  const names = unique([...input.registry, ...input.articles.flatMap((article) => article.tags)]);
  const keep = new Map<string, string | null>();
  const renames: { from: string; to: string }[] = [];
  const deletes: string[] = [];
  const renamedTo = (name: string) => renames.some((rename) => rename.to === name);

  for (const name of names) {
    const rule = resolve(name);
    if (rule.kind !== "tag") {
      if (inRegistry.has(name)) deletes.push(name);
      continue;
    }
    if ((keep.get(rule.final) ?? null) === null) keep.set(rule.final, rule.subject);
    if (rule.final === name || !inRegistry.has(name)) continue;
    // Merge into a tag that already has the new name; otherwise rename in place.
    if (inRegistry.has(rule.final) || renamedTo(rule.final)) deletes.push(name);
    else renames.push({ from: name, to: rule.final });
  }

  const kept = [...keep].map(([name, subject]) => ({ name, subject }));
  kept.sort(
    (a, b) =>
      position(a.subject ?? "") - position(b.subject ?? "") || a.name.localeCompare(b.name, "he"),
  );
  const inserts = kept.map((tag) => tag.name).filter((name) => !inRegistry.has(name) && !renamedTo(name));
  return { keep: kept, renames, inserts, deletes };
}

export function planBackfill(input: BackfillInput, mapping: TaxonomyMapping): BackfillPlan {
  const resolve = buildResolver(mapping);
  const positions = new Map(mapping.subjects.map((subject) => [subject.slug, subject.position]));
  const position = (slug: string) => positions.get(slug) ?? Number.MAX_SAFE_INTEGER;

  return {
    subjects: mapping.subjects,
    tags: planTags(input, resolve, position),
    articles: input.articles.map((article) => planArticle(article, mapping, resolve, position)),
  };
}
