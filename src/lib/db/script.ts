import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { neonConfig, Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { migrate as migrateNeon } from "drizzle-orm/neon-serverless/migrator";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { migrate as migrateNodePostgres } from "drizzle-orm/node-postgres/migrator";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import { checkConfirmedHost } from "./cli";
import { isLocalDatabase } from "./local";
import { MIGRATIONS_CONFIG } from "./migrate";
import * as schema from "./schema";

// Shared runtime for the database scripts in scripts/. Both drivers support
// transactions: Neon over WebSocket (the app's HTTP driver does not), and
// node-postgres for the local Docker database.

export type ScriptDb = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface ScriptContext {
  readonly db: ScriptDb;
  readonly options: { readonly apply: boolean; readonly replace: boolean };
  migrate(migrationsFolder: string): Promise<void>;
  // Returns the host once the operator has confirmed it; stops the script otherwise.
  confirmWrite(): string;
}

export class ScriptStop extends Error {}

interface Connection {
  readonly db: ScriptDb;
  migrate(migrationsFolder: string): Promise<void>;
  close(): Promise<void>;
}

export function connectScriptDb(url: string): Connection {
  if (isLocalDatabase(url)) {
    const pool = new Pool({ connectionString: url });
    const db = drizzleNodePostgres(pool, { schema });
    return {
      db,
      migrate: (migrationsFolder) => migrateNodePostgres(db, { migrationsFolder, ...MIGRATIONS_CONFIG }),
      close: () => pool.end(),
    };
  }
  neonConfig.webSocketConstructor = WebSocket;
  const pool = new NeonPool({ connectionString: url });
  const db = drizzleNeon(pool, { schema });
  return {
    db,
    migrate: (migrationsFolder) => migrateNeon(db, { migrationsFolder, ...MIGRATIONS_CONFIG }),
    close: () => pool.end(),
  };
}

async function run(task: (context: ScriptContext) => Promise<void>): Promise<number> {
  try {
    if (existsSync(".env.local")) process.loadEnvFile(".env.local");
    const { values } = parseArgs({
      options: {
        apply: { type: "boolean", default: false },
        replace: { type: "boolean", default: false },
        "confirm-host": { type: "string" },
      },
      strict: true,
    });
    const url = process.env.DATABASE_URL;
    if (!url) throw new ScriptStop("DATABASE_URL is not set");

    const connection = connectScriptDb(url);
    try {
      await task({
        db: connection.db,
        options: { apply: values.apply, replace: values.replace },
        migrate: connection.migrate,
        confirmWrite() {
          if (isLocalDatabase(url)) return new URL(url).hostname;
          const check = checkConfirmedHost(url, values["confirm-host"]);
          if (!check.ok) throw new ScriptStop(check.message);
          return check.host;
        },
      });
      return 0;
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }
}

export function runDbScript(task: (context: ScriptContext) => Promise<void>): void {
  void run(task).then((code) => process.exit(code));
}
