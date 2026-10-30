import type { ArticleFormat } from "./format";

// Pure planner for moving articles from the flat tag list to subjects,
// subject-owned tags and formats. It reads the old `articles.tags` vocabulary
// and never changes it, so it can be re-run until the new reads go live.

export interface SubjectSeed {
  readonly slug: string;
  readonly name: string;
  readonly position: number;
  readonly onHomepage: boolean;
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
  readonly overrides?: Readonly<Record<number, ArticleOverride>>;
}

export interface BackfillArticle {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly subtitle: string | null;
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

type Resolved = TagRule | { readonly kind: "unmapped" };

function buildResolver(mapping: TaxonomyMapping): (name: string) => Resolved {
  // A tag's new name resolves like its old one, so re-running after the
  // registry was renamed plans the same result.
  const byFinalName = new Map<string, TagRule>();
  for (const [name, rule] of Object.entries(mapping.tags)) {
    if (rule.kind === "tag") {
      byFinalName.set(rule.rename ?? name, { kind: "tag", subject: rule.subject });
    }
  }
  return (name) =>
    (Object.hasOwn(mapping.tags, name) ? mapping.tags[name] : byFinalName.get(name)) ?? {
      kind: "unmapped",
    };
}

function finalName(name: string, rule: Resolved): string {
  return rule.kind === "tag" ? (rule.rename ?? name) : name;
}

function formatFromText(title: string, subtitle: string | null): ArticleFormat {
  if (title.includes("מדריך")) return "guide";
  // A roundup says so in its title, or opens its subtitle with it; "לסיכום"
  // inside a story's subtitle does not count.
  if (title.includes("סיכום") || (subtitle ?? "").trim().startsWith("סיכום")) return "roundup";
  return "story";
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function planArticle(
  article: BackfillArticle,
  mapping: TaxonomyMapping,
  resolve: (name: string) => Resolved,
  position: (slug: string) => number,
): ArticlePlan {
  const override = Object.hasOwn(mapping.overrides ?? {}, article.number)
    ? mapping.overrides?.[article.number]
    : undefined;

  const tags: PlannedTag[] = [];
  const unmapped = new Set<string>();
  const subjectTags: string[] = [];
  const retiredImplied: (readonly string[])[] = [];
  let tagFormat: ArticleFormat | null = null;

  for (const name of article.tags) {
    const rule = resolve(name);
    if (rule.kind === "retire") retiredImplied.push(rule.impliedBy);
    else if (rule.kind === "subject") subjectTags.push(rule.subject);
    else if (rule.kind === "format") tagFormat ??= rule.format;
    else {
      const final = finalName(name, rule);
      if (tags.some((tag) => tag.name === final)) continue;
      tags.push({ name: final, subject: rule.kind === "tag" ? rule.subject : null });
      if (rule.kind === "unmapped") unmapped.add(final);
    }
  }

  const format = override?.format ?? tagFormat ?? formatFromText(article.title, article.subtitle);
  const tagSubjects = unique(tags.flatMap((tag) => (tag.subject ? [tag.subject] : [])));

  let primarySubject: string | null;
  if (override && "primarySubject" in override) {
    primarySubject = override.primarySubject ?? null;
  } else if (subjectTags.length > 0) {
    primarySubject = subjectTags[0];
  } else if (format === "roundup") {
    // A roundup only gets a primary subject when it clearly lives in one.
    primarySubject =
      tagSubjects.length === 1 && retiredImplied.length === 0 ? tagSubjects[0] : null;
  } else {
    primarySubject = tagSubjects[0] ?? null;
  }

  const subjects = unique([
    ...(primarySubject ? [primarySubject] : []),
    ...tagSubjects,
  ]).sort((a, b) => position(a) - position(b));

  const lostCoverage =
    retiredImplied.some((implied) => !implied.some((slug) => subjects.includes(slug))) ||
    subjectTags.some((slug) => !subjects.includes(slug));

  const flags: BackfillFlag[] = [];
  if (subjects.length === 0) flags.push("no-subject");
  if (primarySubject === null && format !== "roundup") flags.push("no-primary");
  if (lostCoverage) flags.push("lost-coverage");
  if (tags.some((tag) => tag.subject === null && !unmapped.has(tag.name))) flags.push("inbox-tag");
  if (unmapped.size > 0) flags.push("unmapped-tag");

  return {
    id: article.id,
    number: article.number,
    title: article.title,
    format,
    primarySubject,
    tags,
    subjects,
    flags,
  };
}

function planTags(
  input: BackfillInput,
  resolve: (name: string) => Resolved,
  position: (slug: string) => number,
): TagChanges {
  const inRegistry = new Set(input.registry);
  const names = unique([...input.registry, ...input.articles.flatMap((article) => article.tags)]);

  const keep = new Map<string, string | null>();
  const renames: { from: string; to: string }[] = [];
  const renamed = new Set<string>();
  const deletes: string[] = [];

  for (const name of names) {
    const rule = resolve(name);
    if (rule.kind === "retire" || rule.kind === "subject" || rule.kind === "format") {
      if (inRegistry.has(name)) deletes.push(name);
      continue;
    }
    const final = finalName(name, rule);
    const subject = rule.kind === "tag" ? rule.subject : null;
    if (!keep.has(final) || keep.get(final) === null) keep.set(final, subject);

    if (final === name || !inRegistry.has(name)) continue;
    if (inRegistry.has(final) || renamed.has(final)) {
      deletes.push(name);
    } else {
      renames.push({ from: name, to: final });
      renamed.add(final);
    }
  }

  const inserts = [...keep.keys()].filter((name) => !inRegistry.has(name) && !renamed.has(name));
  const kept = [...keep].map(([name, subject]) => ({ name, subject }));
  kept.sort(
    (a, b) =>
      position(a.subject ?? "") - position(b.subject ?? "") || a.name.localeCompare(b.name, "he"),
  );

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
