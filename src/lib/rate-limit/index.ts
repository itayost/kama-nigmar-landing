import { createHash, randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { consume, prune, reset, type Limit } from "./limiter";

// Generous on purpose: Israeli mobile carriers put many readers behind one
// address, so these only stop floods, not people.
export const LIMITS = {
  // Login attempts per address; a successful login clears the count.
  login: { max: 5, windowSeconds: 10 * 60 },
  // View beacons per address; past the limit a view is simply not counted.
  view: { max: 120, windowSeconds: 60 },
  // Votes per address on one poll.
  vote: { max: 50, windowSeconds: 60 * 60 },
} as const satisfies Record<string, Limit>;

export type Scope = keyof typeof LIMITS;

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

// Counts a hit and says whether to serve it. A database failure lets the
// request through: these limits are a brake, and every caller has another one
// (bcrypt for logins, plain counting for views and votes).
export async function allow(scope: Scope, key: string): Promise<boolean> {
  try {
    const db = getDb();
    const allowed = await consume(db, key, LIMITS[scope]);
    if (Math.random() < PRUNE_SHARE) await prune(db);
    return allowed;
  } catch (error) {
    // Once per instance: a missing table (migration 0002 not applied) would
    // otherwise log on every view.
    if (!hasLoggedFailure) console.error("rate limit check failed; requests pass unlimited", error);
    hasLoggedFailure = true;
    return true;
  }
}

export async function clearLimit(key: string): Promise<void> {
  try {
    await reset(getDb(), key);
  } catch (error) {
    console.error("rate limit reset failed", error);
  }
}
