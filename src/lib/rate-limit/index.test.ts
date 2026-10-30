import { describe, expect, it } from "vitest";
import { clientAddress, limitKey } from "./index";

describe("clientAddress", () => {
  it("prefers the address Vercel sets", () => {
    expect(clientAddress(new Headers({ "x-real-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" }))).toBe("1.1.1.1");
  });

  it("falls back to the first forwarded address", () => {
    expect(clientAddress(new Headers({ "x-forwarded-for": "3.3.3.3, 10.0.0.1" }))).toBe("3.3.3.3");
  });

  it("groups requests with no address under one key", () => {
    expect(clientAddress(new Headers())).toBe("unknown");
  });
});

describe("limitKey", () => {
  const from = (ip: string) => new Headers({ "x-real-ip": ip });

  it("never contains the address itself", () => {
    expect(limitKey("login", from("203.0.113.7"))).not.toContain("203.0.113.7");
  });

  it("is stable per address and differs between addresses", () => {
    expect(limitKey("view", from("203.0.113.7"))).toBe(limitKey("view", from("203.0.113.7")));
    expect(limitKey("view", from("203.0.113.7"))).not.toBe(limitKey("view", from("203.0.113.8")));
  });

  it("keeps scopes and subjects apart", () => {
    const headers = from("203.0.113.7");
    expect(limitKey("vote", headers, "poll-a")).not.toBe(limitKey("vote", headers, "poll-b"));
    expect(limitKey("vote", headers)).not.toBe(limitKey("login", headers));
  });
});
