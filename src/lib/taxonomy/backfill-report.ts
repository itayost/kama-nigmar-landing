import type { BackfillFlag, BackfillPlan, TaxonomyMapping } from "./backfill-plan";

const FLAG_TEXT: Record<BackfillFlag, string> = {
  "no-subject": "no subject at all",
  "no-primary": "no primary subject",
  "lost-coverage": "a removed tag is no longer covered, add a specific tag",
  "inbox-tag": "has a tag waiting in the inbox",
  "unmapped-tag": "has a tag the mapping does not know",
};

function shorten(text: string, max = 48): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

// Plain-text dry-run report for the operator running the backfill.
export function formatBackfillReport(plan: BackfillPlan, mapping: TaxonomyMapping): string {
  const names = new Map(mapping.subjects.map((subject) => [subject.slug, subject.name]));
  const subjectName = (slug: string | null) => (slug ? (names.get(slug) ?? slug) : "-");
  const lines: string[] = [];

  lines.push(`Subjects (${plan.subjects.length}): ${plan.subjects.map((s) => s.name).join(", ")}`);

  lines.push("", "Tags");
  for (const { from, to } of plan.tags.renames) lines.push(`  Rename: ${from} -> ${to}`);
  for (const name of plan.tags.deletes) lines.push(`  Delete: ${name}`);
  for (const name of plan.tags.inserts) lines.push(`  Insert: ${name}`);
  const inbox = plan.tags.keep.filter((tag) => tag.subject === null).map((tag) => tag.name);
  lines.push(`  Inbox: ${inbox.length > 0 ? inbox.join(", ") : "-"}`);

  lines.push("", "Articles");
  for (const article of plan.articles) {
    const tagNames = article.tags.map((tag) => tag.name).join(", ") || "-";
    lines.push(
      `  #${article.number} ${article.format.padEnd(7)} ${subjectName(article.primarySubject)} | ` +
        `tags: ${tagNames} | in: ${article.subjects.map(subjectName).join(", ") || "-"} | ${shorten(article.title)}`,
    );
  }

  const flagged = plan.articles.filter((article) => article.flags.length > 0);
  lines.push("", `Needs a look (${flagged.length})`);
  for (const article of flagged) {
    lines.push(
      `  #${article.number} ${shorten(article.title)}: ${article.flags.map((flag) => FLAG_TEXT[flag]).join("; ")}`,
    );
  }
  return lines.join("\n");
}
