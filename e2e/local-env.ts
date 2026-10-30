import { localNextEnv } from "../scripts/local-env";

// The E2E specs log in, then create, publish and delete articles, and
// .env.local points at the production database. So the server under test
// always runs against the local Docker database (npm run db:local:up, then
// npm run db:migrate -- --confirm-host=localhost with DATABASE_URL set to it)
// with the local-only admin login, the same environment npm run dev:local uses.
export function localServerEnv(): Record<string, string> {
  const { env, adminPassword } = localNextEnv();
  if (!adminPassword || !env.ADMIN_PASSWORD_HASH || !env.AUTH_SECRET) {
    throw new Error(".env.localdev is incomplete; delete it and run npm run dev:local again.");
  }
  // Read by the specs in the worker processes, which inherit this environment.
  process.env.E2E_ADMIN_PASSWORD = adminPassword;
  return env;
}
