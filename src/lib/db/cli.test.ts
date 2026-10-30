import { describe, expect, it } from "vitest";
import { checkConfirmedHost, parseFlags } from "./cli";

const URL_PROD = "postgresql://user:secret@ep-quiet-sea-123.eu-central-1.aws.neon.tech/neondb?sslmode=require";

describe("checkConfirmedHost", () => {
  it("accepts a confirmation that matches the database host", () => {
    expect(checkConfirmedHost(URL_PROD, "ep-quiet-sea-123.eu-central-1.aws.neon.tech")).toEqual({
      ok: true,
      host: "ep-quiet-sea-123.eu-central-1.aws.neon.tech",
    });
  });

  it("refuses without a confirmation and names the host to confirm", () => {
    const result = checkConfirmedHost(URL_PROD, undefined);
    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.message).toContain(
      "--confirm-host=ep-quiet-sea-123.eu-central-1.aws.neon.tech",
    );
  });

  it("refuses a confirmation for a different host", () => {
    const result = checkConfirmedHost(URL_PROD, "ep-other-branch.eu-central-1.aws.neon.tech");
    expect(result.ok).toBe(false);
  });

  it("refuses when DATABASE_URL is missing", () => {
    const result = checkConfirmedHost(undefined, "anything");
    expect(result).toEqual({ ok: false, message: "DATABASE_URL is not set" });
  });

  it("refuses a DATABASE_URL that is not a URL", () => {
    expect(checkConfirmedHost("not a url", "not a url").ok).toBe(false);
  });

  it("never echoes the password in its message", () => {
    const result = checkConfirmedHost(URL_PROD, undefined);
    expect(result.ok ? "" : result.message).not.toContain("secret");
  });
});

describe("parseFlags", () => {
  it("reads --key=value and bare --flag arguments", () => {
    expect(parseFlags(["--confirm-host=db.example", "--apply", "positional"])).toEqual({
      "confirm-host": "db.example",
      apply: true,
    });
  });
});
