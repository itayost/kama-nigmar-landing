import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { isLocalDatabase } from "./local";
import * as schema from "./schema";

function createNeonDb(url: string) {
  return drizzle(neon(url), { schema });
}

type Db = ReturnType<typeof createNeonDb>;

function createDb(): Db {
  const url = process.env.DATABASE_URL!;
  if (isLocalDatabase(url)) {
    // The Docker database for development and e2e. Same query API; it only
    // lacks Neon's HTTP batch, which runAtomic() covers.
    return drizzleNodePostgres(new Pool({ connectionString: url }), { schema }) as unknown as Db;
  }
  return createNeonDb(url);
}

let db: Db | null = null;

// Lazy init keeps `next build` from crashing before DATABASE_URL is provisioned.
export function getDb() {
  db ??= createDb();
  return db;
}
