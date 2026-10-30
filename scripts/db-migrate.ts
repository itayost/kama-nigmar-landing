// Applies pending migrations from ./drizzle in one transaction.
// Usage: npm run db:migrate -- --confirm-host=<database host>
import { existsSync } from "node:fs";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { checkConfirmedHost, parseFlags } from "@/lib/db/cli";
import { adoptExistingDatabase } from "@/lib/db/migrate";

const MIGRATIONS_FOLDER = "drizzle";

async function main(): Promise<number> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const flags = parseFlags(process.argv.slice(2));
  const confirmed = typeof flags["confirm-host"] === "string" ? flags["confirm-host"] : undefined;

  const check = checkConfirmedHost(process.env.DATABASE_URL, confirmed);
  if (!check.ok) {
    console.error(check.message);
    return 1;
  }

  // The WebSocket driver supports transactions; the app's HTTP driver does not.
  neonConfig.webSocketConstructor = WebSocket;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const db = drizzle(pool);
    if (await adoptExistingDatabase(db, MIGRATIONS_FOLDER)) {
      console.log("Recorded the baseline: this database was built with db:push.");
    }
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    console.log(`Migrations are up to date on ${check.host}.`);
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
