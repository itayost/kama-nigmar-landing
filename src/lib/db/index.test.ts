import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function freshGetDb() {
  vi.resetModules();
  return (await import("./index")).getDb;
}

describe("getDb with LOCAL_ONLY", () => {
  it("refuses a database that is not local", async () => {
    vi.stubEnv("LOCAL_ONLY", "1");
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@ep-example.us-east-1.aws.neon.tech/db");
    const getDb = await freshGetDb();
    expect(() => getDb()).toThrow(/LOCAL_ONLY/);
  });

  it("connects to the local database", async () => {
    vi.stubEnv("LOCAL_ONLY", "1");
    vi.stubEnv("DATABASE_URL", "postgres://kama:kama@localhost:54329/kama");
    const getDb = await freshGetDb();
    expect(() => getDb()).not.toThrow();
  });
});
