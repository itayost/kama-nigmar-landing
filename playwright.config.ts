import { defineConfig } from "@playwright/test";

const E2E_PORT = 3117;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
  },
  webServer: {
    command: `npm run dev -- --port ${E2E_PORT}`,
    url: `http://localhost:${E2E_PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
