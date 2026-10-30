import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { checkConfirmedHost } from "./cli";
import * as schema from "./schema";

// Shared runtime for the database scripts in scripts/. Connects over the Neon
// WebSocket driver, which (unlike the app's HTTP driver) supports transactions.

export interface ScriptContext {
  readonly db: ReturnType<typeof drizzle<typeof schema>>;
  readonly options: { readonly apply: boolean; readonly replace: boolean };
  // Returns the host once the operator has confirmed it; stops the script otherwise.
  confirmWrite(): string;
}

export class ScriptStop extends Error {}

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

    neonConfig.webSocketConstructor = WebSocket;
    const pool = new Pool({ connectionString: url });
    try {
      await task({
        db: drizzle(pool, { schema }),
        options: { apply: values.apply, replace: values.replace },
        confirmWrite() {
          const check = checkConfirmedHost(url, values["confirm-host"]);
          if (!check.ok) throw new ScriptStop(check.message);
          return check.host;
        },
      });
      return 0;
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }
}

export function runDbScript(task: (context: ScriptContext) => Promise<void>): void {
  void run(task).then((code) => process.exit(code));
}
