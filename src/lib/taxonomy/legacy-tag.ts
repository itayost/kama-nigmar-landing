import type { TaxonomyMapping } from "./backfill-plan";

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
