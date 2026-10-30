// The environment for running the site against the local Docker database:
// npm run dev:local and both E2E configs use it. The first call writes
// .env.localdev (gitignored) with a generated admin password; production
// credentials are never used.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import bcrypt from "bcryptjs";
import { LOCAL_DATABASE_URL } from "../src/lib/db/local";

const ENV_FILE = ".env.localdev";

export interface LocalEnv {
  // Variables for the next process.
  readonly env: Record<string, string>;
  // The admin password that works against it.
  readonly adminPassword: string;
}

export function localNextEnv(): LocalEnv {
  if (!existsSync(ENV_FILE)) {
    const password = randomBytes(12).toString("base64url");
    writeFileSync(
      ENV_FILE,
      [
        "# Local-only admin login for npm run dev:local and E2E. Not valid anywhere else.",
        `LOCAL_ADMIN_PASSWORD=${password}`,
        `LOCAL_ADMIN_PASSWORD_HASH=${bcrypt.hashSync(password, 10)}`,
        `LOCAL_AUTH_SECRET=${randomBytes(32).toString("base64")}`,
        "",
      ].join("\n"),
      { mode: 0o600 },
    );
    console.log(`Created ${ENV_FILE}; the admin password is in it.`);
  }
  const local = parseEnv(readFileSync(ENV_FILE, "utf8"));
  // Only public settings (show links and the like) come over from .env.local, so
  // no production secret reaches local runs. Next's own loader is switched off
  // (__NEXT_PROCESSED_ENV) because it would $-expand the bcrypt hash below.
  const publicSettings = existsSync(".env.local")
    ? Object.fromEntries(
        Object.entries(parseEnv(readFileSync(".env.local", "utf8"))).filter(
          ([key]) => key.startsWith("NEXT_PUBLIC_") && !key.startsWith("NEXT_PUBLIC_POSTHOG"),
        ),
      )
    : {};
  return {
    env: {
      ...publicSettings,
      __NEXT_PROCESSED_ENV: "true",
      DATABASE_URL: LOCAL_DATABASE_URL,
      ADMIN_PASSWORD_HASH: local.LOCAL_ADMIN_PASSWORD_HASH ?? "",
      AUTH_SECRET: local.LOCAL_AUTH_SECRET ?? "",
    },
    adminPassword: local.LOCAL_ADMIN_PASSWORD ?? "",
  };
}
