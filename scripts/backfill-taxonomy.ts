// Moves articles from the flat tag list to subjects, subject-owned tags and
// formats. Prints the plan by default; writes only with --apply.
// Usage:
//   npm run db:backfill-taxonomy
//   npm run db:backfill-taxonomy -- --apply --confirm-host=<database host>
//   add --replace to rebuild links that an earlier run already wrote
import { articleTags } from "@/lib/db/schema";
import { runDbScript, ScriptStop } from "@/lib/db/script";
import { applyBackfillPlan, loadBackfillInput } from "@/lib/taxonomy/backfill-apply";
import { planBackfill } from "@/lib/taxonomy/backfill-plan";
import { formatBackfillReport } from "@/lib/taxonomy/backfill-report";
import { TAXONOMY_MAPPING } from "@/lib/taxonomy/mapping";

runDbScript(async ({ db, options, confirmWrite }) => {
  const plan = planBackfill(await loadBackfillInput(db), TAXONOMY_MAPPING);
  console.log(formatBackfillReport(plan, TAXONOMY_MAPPING));

  if (!options.apply) {
    console.log("\nDry run: nothing was written. Add --apply --confirm-host=<host> to write it.");
    return;
  }

  const host = confirmWrite();
  const existing = await db.$count(articleTags);
  if (existing > 0 && !options.replace) {
    throw new ScriptStop(
      `article_tags already has ${existing} links, so the backfill has run before. ` +
        "Add --replace to rebuild them from articles.tags. Only do that before the new admin goes live, " +
        "because it overwrites tag changes made there.",
    );
  }

  await applyBackfillPlan(db, plan);
  console.log(`\nBackfill written to ${host}.`);
});
