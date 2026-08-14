import { defineConfig } from "@playwright/test";

const E2E_PROD_PORT = 3118;

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
    url: `http://localhost:${E2E_PROD_PORT}`,
    // Never reuse: the point of these specs is what the build produced from current source.
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
