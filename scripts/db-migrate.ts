// Applies pending migrations from ./drizzle in one transaction.
// Usage: npm run db:migrate -- --confirm-host=<database host>
import { adoptExistingDatabase } from "@/lib/db/migrate";
import { runDbScript } from "@/lib/db/script";

const migrationsFolder = "drizzle";

runDbScript(async ({ db, migrate, confirmWrite }) => {
  const host = confirmWrite();
  if (await adoptExistingDatabase(db, migrationsFolder)) {
    console.log("Recorded the baseline: this database was built with db:push.");
  }
  await migrate(migrationsFolder);
  console.log(`Migrations are up to date on ${host}.`);
});
