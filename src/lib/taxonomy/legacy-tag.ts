import type { TaxonomyMapping } from "./backfill-plan";
import { ROUNDUPS, subjectPath } from "./public";

// Where an old /articles?tag=<name> link goes now. "tag" still needs the
// registry: the admin may have moved the tag to another subject since.
export type LegacyTagTarget =
  | { readonly kind: "subject"; readonly slug: string }
  | { readonly kind: "roundups" }
  | { readonly kind: "tag"; readonly name: string }
  | { readonly kind: "archive" };

export function legacyTagTarget(name: string, mapping: TaxonomyMapping): LegacyTagTarget {
  const rule = mapping.tags[name];
  if (!rule) return { kind: "tag", name };
  switch (rule.kind) {
    case "subject":
      return { kind: "subject", slug: rule.subject };
    case "format":
      return rule.format === "roundup" ? { kind: "roundups" } : { kind: "archive" };
    case "tag":
      return { kind: "tag", name: rule.rename ?? name };
    case "retire":
      return { kind: "archive" };
  }
}

export interface LegacyRedirect {
  readonly path: string;
  // Only what the mapping alone decides is permanent. Anything that depends on
  // where the admin files a tag today is temporary, so a later move is not
  // stuck in browser and crawler caches.
  readonly permanent: boolean;
}

const ARCHIVE = "/articles";

// `liveSlug` is the database's answer: for a subject target, its slug if that
// subject still exists; for a tag target, the slug of the subject it is filed
// under. Null when there is none.
export function legacyTagRedirect(target: LegacyTagTarget, liveSlug: string | null): LegacyRedirect {
  switch (target.kind) {
    case "roundups":
      return { path: ROUNDUPS.href, permanent: true };
    case "archive":
      return { path: ARCHIVE, permanent: true };
    case "subject":
      return liveSlug ? { path: subjectPath(liveSlug), permanent: true } : { path: ARCHIVE, permanent: false };
    case "tag":
      return liveSlug
        ? { path: `${subjectPath(liveSlug)}?${new URLSearchParams({ tag: target.name })}`, permanent: false }
        : { path: ARCHIVE, permanent: false };
  }
}
