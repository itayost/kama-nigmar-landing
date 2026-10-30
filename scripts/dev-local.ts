// Runs the site against the local Docker database, with an admin login that
// only works locally. The first run writes .env.localdev (gitignored) with a
// generated password; production credentials are never used.
// Usage: npm run dev:local   (then open http://localhost:3210)
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import bcrypt from "bcryptjs";
import { LOCAL_DATABASE_URL } from "@/lib/db/local";

const ENV_FILE = ".env.localdev";
const PORT = process.env.PORT ?? "3210";

if (!existsSync(ENV_FILE)) {
  const password = randomBytes(12).toString("base64url");
  writeFileSync(
    ENV_FILE,
    [
      "# Local-only admin login for npm run dev:local. Not valid anywhere else.",
      `LOCAL_ADMIN_PASSWORD=${password}`,
      `LOCAL_ADMIN_PASSWORD_HASH=${bcrypt.hashSync(password, 10)}`,
      `LOCAL_AUTH_SECRET=${randomBytes(32).toString("base64")}`,
      "",
    ].join("\n"),
    { mode: 0o600 },
  );
  console.log(`Created ${ENV_FILE}; the admin password is in it.`);
}
process.loadEnvFile(ENV_FILE);
// Only public settings (show links and the like) come over from .env.local, so
// no production secret reaches local dev. Next's own loader is switched off
// (__NEXT_PROCESSED_ENV) because it would $-expand the bcrypt hash below.
const publicSettings = existsSync(".env.local")
  ? Object.fromEntries(
      Object.entries(parseEnv(readFileSync(".env.local", "utf8"))).filter(
        ([key]) => key.startsWith("NEXT_PUBLIC_") && !key.startsWith("NEXT_PUBLIC_POSTHOG"),
      ),
    )
  : {};

// Loopback only: the admin login above is meant for this machine.
const child = spawn("npx", ["next", "dev", "--port", PORT, "--hostname", "localhost"], {
  stdio: "inherit",
  env: {
    ...process.env,
    ...publicSettings,
    __NEXT_PROCESSED_ENV: "true",
    DATABASE_URL: LOCAL_DATABASE_URL,
    ADMIN_PASSWORD_HASH: process.env.LOCAL_ADMIN_PASSWORD_HASH,
    AUTH_SECRET: process.env.LOCAL_AUTH_SECRET,
  },
});
child.on("exit", (code) => process.exit(code ?? 0));
