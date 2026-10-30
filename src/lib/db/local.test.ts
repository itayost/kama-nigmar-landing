import { describe, expect, it } from "vitest";
import { isLocalDatabase } from "./local";

describe("isLocalDatabase", () => {
  it("recognizes the Docker database on localhost", () => {
    expect(isLocalDatabase("postgres://kama:kama@localhost:54329/kama")).toBe(true);
    expect(isLocalDatabase("postgres://kama:kama@127.0.0.1:54329/kama")).toBe(true);
  });

  it("treats a Neon host as remote", () => {
    expect(isLocalDatabase("postgresql://u:p@ep-quiet-sea-123.eu-central-1.aws.neon.tech/neondb")).toBe(false);
  });

  it("treats a missing or malformed URL as remote", () => {
    expect(isLocalDatabase(undefined)).toBe(false);
    expect(isLocalDatabase("not a url")).toBe(false);
  });
});
