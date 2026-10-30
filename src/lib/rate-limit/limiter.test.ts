import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { consume, prune, reset } from "./limiter";

let client: PGlite;
let db: ReturnType<typeof drizzle>;

beforeEach(async () => {
  client = new PGlite();
  db = drizzle(client);
  await db.execute(sql`
    create table rate_limits (
      key text primary key,
      hits integer not null,
      window_ends_at timestamptz not null
    )`);
});

afterEach(async () => {
  await client.close();
});

const LIMIT = { max: 3, windowSeconds: 60 };

describe("consume", () => {
  it("allows hits up to the limit and refuses the next one", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await consume(db, "login:a", LIMIT));
    expect(results).toEqual([true, true, true, false]);
  });

  it("counts each key on its own", async () => {
    for (let i = 0; i < 3; i++) await consume(db, "login:a", LIMIT);
    expect(await consume(db, "login:b", LIMIT)).toBe(true);
  });

  it("starts a fresh window once the old one has ended", async () => {
    for (let i = 0; i < 4; i++) await consume(db, "login:a", LIMIT);
    await db.execute(sql`update rate_limits set window_ends_at = now() - interval '1 second'`);
    expect(await consume(db, "login:a", LIMIT)).toBe(true);
  });
});

describe("reset", () => {
  it("clears a key so it starts over", async () => {
    for (let i = 0; i < 4; i++) await consume(db, "login:a", LIMIT);
    await reset(db, "login:a");
    expect(await consume(db, "login:a", LIMIT)).toBe(true);
  });
});

describe("prune", () => {
  it("deletes only windows that have ended", async () => {
    await consume(db, "old", LIMIT);
    await consume(db, "live", LIMIT);
    await db.execute(sql`update rate_limits set window_ends_at = now() - interval '1 second' where key = 'old'`);
    await prune(db);
    const rows = await db.execute(sql`select key from rate_limits`);
    expect(rows.rows).toEqual([{ key: "live" }]);
  });
});
