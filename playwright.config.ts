import { defineConfig } from "@playwright/test";
import { localServerEnv } from "./e2e/local-env";

const E2E_PORT = 3117;

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
    // Against the local Docker database, like npm run dev:local; see e2e/local-env.ts.
    command: `npx next dev --port ${E2E_PORT} --hostname localhost`,
    env: localServerEnv(),
    url: `http://localhost:${E2E_PORT}`,
    // Never reuse: a server already on this port may be talking to production.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
