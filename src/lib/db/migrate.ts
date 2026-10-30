import { sql, type SQL } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";

// Production was built with `drizzle-kit push`, so it has the baseline schema
// but no migration history. Recording the baseline as applied lets `migrate`
// start from the first real migration instead of re-creating existing tables.

interface Executor {
  execute(query: SQL): PromiseLike<unknown>;
}

// Columns added last before the baseline was cut. A database missing any of
// them is older than the baseline and must not be marked as matching it.
const BASELINE_MARKERS: readonly (readonly [table: string, column: string])[] = [
  ["articles", "number"],
  ["articles", "poll_id"],
  ["polls", "is_main"],
];

export function rowsOf(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  const rows = (result as { rows?: unknown } | null)?.rows;
  return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
}

async function firstRow(db: Executor, query: SQL): Promise<Record<string, unknown>> {
  return rowsOf(await db.execute(query))[0] ?? {};
}

export async function adoptExistingDatabase(
  db: Executor,
  migrationsFolder: string,
): Promise<boolean> {
  const [baseline] = readMigrationFiles({ migrationsFolder });
  if (!baseline) return false;

  const existing = await firstRow(db, sql`select to_regclass('public.articles') is not null as present`);
  if (existing.present !== true) return false;

  const history = await firstRow(
    db,
    sql`select to_regclass('drizzle.__drizzle_migrations') is not null as present`,
  );
  if (history.present === true) {
    const recorded = await firstRow(db, sql`select count(*)::int as n from drizzle.__drizzle_migrations`);
    if (Number(recorded.n) > 0) return false;
  }

  for (const [table, column] of BASELINE_MARKERS) {
    const found = await firstRow(
      db,
      sql`select count(*)::int as n from information_schema.columns
          where table_schema = 'public' and table_name = ${table} and column_name = ${column}`,
    );
    if (Number(found.n) === 0) {
      throw new Error(
        `This database is older than the baseline (${table}.${column} is missing). ` +
          "Bring it up to date from a checkout of the commit before migrations were introduced " +
          "(drizzle-kit push there), never with push from this branch.",
      );
    }
  }

  await db.execute(sql`create schema if not exists drizzle`);
  await db.execute(sql`
    create table if not exists drizzle.__drizzle_migrations (
      id serial primary key,
      hash text not null,
      created_at bigint
    )
  `);
  await db.execute(
    sql`insert into drizzle.__drizzle_migrations (hash, created_at) values (${baseline.hash}, ${baseline.folderMillis})`,
  );
  return true;
}
