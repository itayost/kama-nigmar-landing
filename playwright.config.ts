import { defineConfig } from "@playwright/test";
import { localNextEnv } from "./scripts/local-env";

const E2E_PORT = 3117;

// The specs log in, then create, publish and delete articles, and .env.local
// points at production. So the server runs against the local Docker database
// (npm run db:local:up, then npm run db:migrate -- --confirm-host=localhost
// with DATABASE_URL set to it), with the local admin login handed to the
// specs, whose worker processes inherit this environment.
const local = localNextEnv();
process.env.E2E_ADMIN_PASSWORD = local.adminPassword;

export default defineConfig({
  testDir: "./e2e",
  // e2e/prod runs against a real production build instead of `next dev`, which is the only
  // way to exercise prerendered artifacts. It has its own config; see playwright.prod.config.ts.
  testIgnore: "prod/**",
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
  },
  webServer: {
    // Against the local Docker database, like npm run dev:local; see above.
    command: `npx next dev --port ${E2E_PORT} --hostname localhost`,
    env: local.env,
    url: `http://localhost:${E2E_PORT}`,
    // Never reuse: a server already on this port may be talking to production.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
