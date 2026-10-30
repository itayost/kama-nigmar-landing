// Moves articles from the flat tag list to subjects, subject-owned tags and
// formats. Prints the plan by default; writes only with --apply.
// Usage:
//   npm run db:backfill-taxonomy
//   npm run db:backfill-taxonomy -- --apply --confirm-host=<database host>
//   add --replace to rebuild links that an earlier run already wrote
import { existsSync } from "node:fs";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { checkConfirmedHost, parseFlags } from "@/lib/db/cli";
import * as schema from "@/lib/db/schema";
import { applyBackfillPlan, countArticleTags, loadBackfillInput } from "@/lib/taxonomy/backfill-apply";
import { planBackfill } from "@/lib/taxonomy/backfill-plan";
import { formatBackfillReport } from "@/lib/taxonomy/backfill-report";
import { TAXONOMY_MAPPING } from "@/lib/taxonomy/mapping";

async function main(): Promise<number> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const flags = parseFlags(process.argv.slice(2));
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    return 1;
  }

  neonConfig.webSocketConstructor = WebSocket;
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const db = drizzle(pool, { schema });
    const plan = planBackfill(await loadBackfillInput(db), TAXONOMY_MAPPING);
    console.log(formatBackfillReport(plan, TAXONOMY_MAPPING));

    if (flags.apply !== true) {
      console.log("\nDry run: nothing was written. Add --apply --confirm-host=<host> to write it.");
      return 0;
    }

    const confirmed = typeof flags["confirm-host"] === "string" ? flags["confirm-host"] : undefined;
    const check = checkConfirmedHost(databaseUrl, confirmed);
    if (!check.ok) {
      console.error(`\n${check.message}`);
      return 1;
    }

    const existing = await countArticleTags(db);
    if (existing > 0 && flags.replace !== true) {
      console.error(
        `\narticle_tags already has ${existing} links, so the backfill has run before. ` +
          "Add --replace to rebuild them from articles.tags. Only do that before the new admin goes live, " +
          "because it overwrites tag changes made there.",
      );
      return 1;
    }

    await applyBackfillPlan(db, plan);
    console.log(`\nBackfill written to ${check.host}.`);
    return 0;
  } finally {
    await pool.end();
  }
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
