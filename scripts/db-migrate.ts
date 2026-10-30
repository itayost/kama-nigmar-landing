// Applies pending migrations from ./drizzle in one transaction.
// Usage: npm run db:migrate -- --confirm-host=<database host>
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { adoptExistingDatabase, MIGRATIONS_CONFIG } from "@/lib/db/migrate";
import { runDbScript } from "@/lib/db/script";

const migrationsFolder = "drizzle";

runDbScript(async ({ db, confirmWrite }) => {
  const host = confirmWrite();
  if (await adoptExistingDatabase(db, migrationsFolder)) {
    console.log("Recorded the baseline: this database was built with db:push.");
  }
  await migrate(db, { migrationsFolder, ...MIGRATIONS_CONFIG });
  console.log(`Migrations are up to date on ${host}.`);
});
