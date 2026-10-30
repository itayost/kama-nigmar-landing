// Runs the site against the local Docker database, with an admin login that
// only works locally. The first run writes .env.localdev (gitignored) with a
// generated password; production credentials are never used.
// Usage: npm run dev:local   (then open http://localhost:3210)
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
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

const child = spawn("npx", ["next", "dev", "--port", PORT], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: LOCAL_DATABASE_URL,
    ADMIN_PASSWORD_HASH: process.env.LOCAL_ADMIN_PASSWORD_HASH,
    AUTH_SECRET: process.env.LOCAL_AUTH_SECRET,
    // Keep local clicks out of production analytics.
    NEXT_PUBLIC_POSTHOG_KEY: "",
  },
});
child.on("exit", (code) => process.exit(code ?? 0));
