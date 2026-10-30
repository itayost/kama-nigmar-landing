import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { afterEach, describe, expect, it } from "vitest";
import { runAtomic } from "./atomic";

let client: PGlite | null = null;

afterEach(async () => {
  await client?.close();
  client = null;
});

describe("runAtomic", () => {
  it("hands every query to the driver's batch when it has one", async () => {
    const calls: unknown[][] = [];
    const db = { batch: async (queries: unknown[]) => (calls.push(queries), ["first", "second"]) };
    const queries = [Promise.resolve("a"), Promise.resolve("b")] as never;

    expect(await runAtomic(db, queries)).toEqual(["first", "second"]);
    expect(calls).toEqual([queries]);
  });

  it("runs the queries in order on a driver without batch", async () => {
    client = new PGlite();
    const db = drizzle(client);
    await db.execute(sql`create table log (n int)`);

    await runAtomic(db, [
      db.execute(sql`insert into log values (1)`),
      db.execute(sql`insert into log values (2)`),
    ]);

    const result = await db.execute(sql`select n from log order by n`);
    expect(result.rows).toEqual([{ n: 1 }, { n: 2 }]);
  });
});
