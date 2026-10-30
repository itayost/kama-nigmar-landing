import { defineConfig } from "@playwright/test";
import { localNextEnv } from "./scripts/local-env";

const E2E_PROD_PORT = 3118;

// The specs write articles, so the build runs against the local Docker database
// with the local admin login, exactly as in playwright.config.ts.
const local = localNextEnv();
process.env.E2E_ADMIN_PASSWORD = local.adminPassword;

// `next dev` has no prerendered artifacts: no PPR fallback shell, no ISR entries, no
// generateStaticParams snapshot. Every bug in that layer is invisible to the main e2e
// suite no matter how the test is written, which is why the shared-not-found regression
// reached production twice. These specs run against a real build instead.
export default defineConfig({
  testDir: "./e2e/prod",
  timeout: 120_000,
  use: {
    baseURL: `http://localhost:${E2E_PROD_PORT}`,
  },
  webServer: {
    command: `npm run build && npm run start -- --port ${E2E_PROD_PORT}`,
    // Built and served against the local Docker database; see above.
    // The podcast feed is switched off so no run depends on the network.
    env: { ...local.env, PODCAST_FEED_URL: "" },
    url: `http://localhost:${E2E_PROD_PORT}`,
    // Never reuse: the point of these specs is what the build produced from current source.
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
