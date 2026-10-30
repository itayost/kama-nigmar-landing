import { createHash, randomBytes } from "node:crypto";
import { after } from "next/server";
import { getDb } from "@/lib/db";
import { consume, prune, reset, type Limit } from "./limiter";

interface Policy extends Limit {
  // What to answer when the count cannot be read.
  readonly failOpen: boolean;
}

// Generous on purpose: Israeli mobile carriers put many readers behind one
// address, so these only stop floods, not people.
const LIMITS = {
  // Login attempts per address; a successful login clears the count. Closed on
  // failure: a database outage must not open the door to guessing, and the
  // admin needs the database anyway.
  login: { max: 5, windowSeconds: 10 * 60, failOpen: false },
  // View beacons per address; past the limit a view is simply not counted.
  view: { max: 120, windowSeconds: 60, failOpen: true },
  // Votes per address on one poll.
  vote: { max: 50, windowSeconds: 60 * 60, failOpen: true },
} as const satisfies Record<string, Policy>;

type Scope = keyof typeof LIMITS;

export interface RateLimit {
  readonly allowed: boolean;
  // Starts the count over, e.g. after a successful login.
  clear(): Promise<void>;
}

const PRUNE_SHARE = 0.01;

// Without the site secret, a random one per instance: limits then only hold
// per instance, but a stored key can never be traced back to an address.
const KEY_SECRET = process.env.AUTH_SECRET || randomBytes(32).toString("base64");

let hasLoggedFailure = false;

// Vercel sets both headers from the connection, overwriting anything the
// client sent. On a host that passes them through, a client could pick its own
// bucket; the site only deploys to Vercel.
export function clientAddress(headers: Headers): string {
  return headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// The address is hashed with the site secret, so the table never holds it.
export function limitKey(scope: Scope, headers: Headers, subject = ""): string {
  const digest = createHash("sha256")
    .update(`${KEY_SECRET}:${clientAddress(headers)}`)
    .digest("base64url")
    .slice(0, 22);
  return subject ? `${scope}:${subject}:${digest}` : `${scope}:${digest}`;
}

// Counts a hit for this address (and subject, e.g. a poll) and says whether
// to serve it.
export async function rateLimit(scope: Scope, headers: Headers, subject = ""): Promise<RateLimit> {
  const key = limitKey(scope, headers, subject);
  const clear = () =>
    reset(getDb(), key).catch((error: unknown) => console.error("rate limit reset failed", error));
  try {
    const db = getDb();
    const allowed = await consume(db, key, LIMITS[scope]);
    // Ended windows are cleared now and then, after the response is sent.
    if (Math.random() < PRUNE_SHARE) after(() => prune(db));
    return { allowed, clear };
  } catch (error) {
    // Once per instance: a missing table (migration 0002 not applied) would
    // otherwise log on every view.
    if (!hasLoggedFailure) console.error("rate limit check failed; using each scope's fallback", error);
    hasLoggedFailure = true;
    return { allowed: LIMITS[scope].failOpen, clear };
  }
}
