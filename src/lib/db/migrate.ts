import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql, type SQL } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { rowsOf, type Executor } from "./rows";

// Production was built with `drizzle-kit push`, so it has the baseline schema
// but no migration history. Recording the baseline as applied lets `migrate`
// start from the first real migration instead of re-creating existing tables.

// Passed to `migrate()` as well, so both write the same history table.
export const MIGRATIONS_CONFIG = {
  migrationsSchema: "drizzle",
  migrationsTable: "__drizzle_migrations",
} as const;

interface Snapshot {
  readonly tables: Record<string, { readonly name: string; readonly columns: Record<string, { readonly name: string }> }>;
}

const history = sql`${sql.identifier(MIGRATIONS_CONFIG.migrationsSchema)}.${sql.identifier(MIGRATIONS_CONFIG.migrationsTable)}`;

async function firstRow(db: Executor, query: SQL): Promise<Record<string, unknown>> {
  return rowsOf(await db.execute(query))[0] ?? {};
}

function baselineColumns(migrationsFolder: string): SQL[] {
  const snapshot = JSON.parse(
    readFileSync(join(migrationsFolder, "meta", "0000_snapshot.json"), "utf8"),
  ) as Snapshot;
  return Object.values(snapshot.tables).flatMap((table) =>
    Object.values(table.columns).map((column) => sql`(${table.name}, ${column.name})`),
  );
}

// Every column the baseline declares must exist before the database may be
// marked as matching it.
async function missingBaselineColumn(db: Executor, migrationsFolder: string): Promise<string | null> {
  const row = await firstRow(
    db,
    sql`select b.table_name || '.' || b.column_name as missing
        from (values ${sql.join(baselineColumns(migrationsFolder), sql`, `)}) as b(table_name, column_name)
        where not exists (
          select 1 from information_schema.columns c
          where c.table_schema = 'public' and c.table_name = b.table_name and c.column_name = b.column_name
        )
        limit 1`,
  );
  return typeof row.missing === "string" ? row.missing : null;
}

export async function adoptExistingDatabase(
  db: Executor,
  migrationsFolder: string,
): Promise<boolean> {
  const [baseline] = readMigrationFiles({ migrationsFolder });
  if (!baseline) return false;

  const state = await firstRow(
    db,
    sql`select to_regclass('public.articles') is not null as built,
               to_regclass(${`${MIGRATIONS_CONFIG.migrationsSchema}.${MIGRATIONS_CONFIG.migrationsTable}`}) is not null as tracked`,
  );
  if (state.built !== true) return false;
  if (state.tracked === true) {
    const recorded = await firstRow(db, sql`select count(*)::int as n from ${history}`);
    if (Number(recorded.n) > 0) return false;
  }

  const missing = await missingBaselineColumn(db, migrationsFolder);
  if (missing) {
    throw new Error(
      `This database is older than the baseline (${missing} is missing). ` +
        "Bring it up to date from a checkout of the commit before migrations were introduced " +
        "(drizzle-kit push there), never with push from this branch.",
    );
  }

  await db.execute(sql`create schema if not exists ${sql.identifier(MIGRATIONS_CONFIG.migrationsSchema)}`);
  await db.execute(sql`create table if not exists ${history} (id serial primary key, hash text not null, created_at bigint)`);
  await db.execute(sql`insert into ${history} (hash, created_at) values (${baseline.hash}, ${baseline.folderMillis})`);
  return true;
}
