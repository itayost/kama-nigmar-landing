// Copies the site's data into the local Docker database so development and
// e2e run against real content without touching production. Reads the source
// (DATABASE_URL, normally production) with SELECTs only; rebuilds the local
// database from the migrations first.
// Usage: npm run db:local:up && npm run db:local:clone
import { existsSync } from "node:fs";
import { sql, type SQL } from "drizzle-orm";
import { isLocalDatabase, LOCAL_DATABASE_URL } from "@/lib/db/local";
import { rowsOf } from "@/lib/db/migrate";
import { connectScriptDb, type ScriptDb } from "@/lib/db/script";

// Parents before children, so foreign keys hold while inserting.
const TABLES = ["polls", "subjects", "tags", "articles", "article_tags", "poll_votes", "article_views_daily"];

async function columnTypes(db: ScriptDb, table: string): Promise<Map<string, string>> {
  const result = await db.execute(sql`
    select column_name, data_type from information_schema.columns
    where table_schema = 'public' and table_name = ${table}
    order by ordinal_position
  `);
  return new Map(rowsOf(result).map((row) => [String(row.column_name), String(row.data_type)]));
}

function valueSql(value: unknown, type: string | undefined): SQL {
  // jsonb goes over as JSON text; everything else, arrays included, as one parameter.
  return type === "jsonb" ? sql`${JSON.stringify(value)}::jsonb` : sql`${sql.param(value)}`;
}

async function copyTable(source: ScriptDb, target: ScriptDb, table: string): Promise<number> {
  const from = await columnTypes(source, table);
  if (from.size === 0) return 0;
  const to = await columnTypes(target, table);
  const shared = [...from.keys()].filter((column) => to.has(column));
  const columnList = sql.join(shared.map((column) => sql.identifier(column)), sql`, `);

  const rows = rowsOf(await source.execute(sql`select ${columnList} from ${sql.identifier(table)}`));
  if (rows.length === 0) return 0;
  // Chunks keep each statement under Postgres's 65535-parameter limit.
  const chunkSize = Math.max(1, Math.floor(60000 / shared.length));
  for (let start = 0; start < rows.length; start += chunkSize) {
    const values = rows
      .slice(start, start + chunkSize)
      .map((row) => sql`(${sql.join(shared.map((column) => valueSql(row[column], to.get(column))), sql`, `)})`);
    await target.execute(sql`
      insert into ${sql.identifier(table)} (${columnList}) overriding system value
      values ${sql.join(values, sql`, `)}
    `);
  }
  return rows.length;
}

async function main(): Promise<void> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const sourceUrl = process.env.DATABASE_URL;
  if (!sourceUrl || isLocalDatabase(sourceUrl)) {
    throw new Error("DATABASE_URL must point at the database to copy from, not the local one.");
  }

  const source = connectScriptDb(sourceUrl);
  const target = connectScriptDb(LOCAL_DATABASE_URL);
  try {
    await target.db.execute(sql`drop schema if exists drizzle cascade`);
    await target.db.execute(sql`drop schema if exists public cascade`);
    await target.db.execute(sql`create schema public`);
    await target.migrate("drizzle");

    for (const table of TABLES) {
      const copied = await copyTable(source.db, target.db, table);
      console.log(`${table}: ${copied}`);
    }
    await target.db.execute(
      sql`select setval(pg_get_serial_sequence('articles', 'number'), coalesce(max(number), 1)) from articles`,
    );
    console.log("Local database is a fresh copy.");
  } finally {
    await Promise.all([source.close(), target.close()]);
  }
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
