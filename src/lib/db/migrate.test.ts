import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import { adoptExistingDatabase, MIGRATIONS_CONFIG } from "./migrate";

const migrationsFolder = fileURLToPath(new URL("../../../drizzle", import.meta.url));

let client: PGlite | null = null;

afterEach(async () => {
  await client?.close();
  client = null;
});

// A database built the way production was: `drizzle-kit push`, no history.
async function pushedDatabase() {
  client = new PGlite();
  const [baseline] = readMigrationFiles({ migrationsFolder });
  for (const statement of baseline.sql) await client.exec(statement);
  return drizzle(client);
}

async function emptyDatabase() {
  client = new PGlite();
  return drizzle(client);
}

type Db = Awaited<ReturnType<typeof emptyDatabase>>;

function rowsOf(result: unknown): Record<string, unknown>[] {
  return (result as { rows: Record<string, unknown>[] }).rows;
}

const migrateAll = (db: Db) => migrate(db, { migrationsFolder, ...MIGRATIONS_CONFIG });

async function tableExists(db: Db, name: string): Promise<boolean> {
  const rows = rowsOf(await db.execute(sql`select to_regclass(${`public.${name}`}) is not null as present`));
  return rows[0].present === true;
}

async function historyCount(db: Db): Promise<number> {
  const rows = rowsOf(await db.execute(sql`select count(*)::int as n from drizzle.__drizzle_migrations`));
  return Number(rows[0].n);
}

describe("adoptExistingDatabase", () => {
  it("records the baseline on a pushed database so migrate only applies what is new", async () => {
    const db = await pushedDatabase();

    expect(await adoptExistingDatabase(db, migrationsFolder)).toBe(true);
    await migrateAll(db);

    expect(await tableExists(db, "subjects")).toBe(true);
    expect(await tableExists(db, "article_tags")).toBe(true);
  });

  it("leaves an empty database alone so migrate builds it from scratch", async () => {
    const db = await emptyDatabase();

    expect(await adoptExistingDatabase(db, migrationsFolder)).toBe(false);
    await migrateAll(db);

    expect(await tableExists(db, "articles")).toBe(true);
    expect(await tableExists(db, "subjects")).toBe(true);
  });

  it("records the baseline only once", async () => {
    const db = await pushedDatabase();

    await adoptExistingDatabase(db, migrationsFolder);
    expect(await adoptExistingDatabase(db, migrationsFolder)).toBe(false);

    expect(await historyCount(db)).toBe(1);
  });

  it("refuses a database older than the baseline", async () => {
    const db = await emptyDatabase();
    await db.execute(sql`create table articles (id uuid primary key, title text not null)`);

    await expect(adoptExistingDatabase(db, migrationsFolder)).rejects.toThrow(/older than the baseline/);
  });

  it("keeps existing articles intact and gives them the story format", async () => {
    const db = await pushedDatabase();
    await db.execute(
      sql`insert into articles (title, author_name, tags) values ('כתבה', 'גיא', '{"כדורגל","ליגת העל"}')`,
    );

    await adoptExistingDatabase(db, migrationsFolder);
    await migrateAll(db);

    const rows = rowsOf(await db.execute(sql`select tags, format, primary_subject_id from articles`));
    expect(rows[0]).toEqual({ tags: ["כדורגל", "ליגת העל"], format: "story", primary_subject_id: null });
  });
});
