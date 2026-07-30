const MAX_FAILURES = 5;
const LOCKOUT_MS = 10 * 60 * 1000;
// Entries expire this long after the last failure, so many distinct keys
// (e.g. an IP spray) cannot grow the map without bound.
const ENTRY_TTL_MS = LOCKOUT_MS;

interface AttemptEntry {
  readonly failures: number;
  readonly lockedUntil: number;
  readonly expiresAt: number;
}

// Per-instance memory only: resets on cold start. Acceptable for a
// single-admin site; the bcrypt work factor is the real brute-force brake.
const attempts = new Map<string, AttemptEntry>();

function pruneExpired(now: number): void {
  for (const [key, entry] of attempts) {
    if (entry.expiresAt <= now && entry.lockedUntil <= now) {
      attempts.delete(key);
    }
  }
}

export function isLockedOut(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry) return false;
  if (entry.lockedUntil > now) return true;
  if (entry.lockedUntil > 0 || entry.expiresAt <= now) {
    attempts.delete(key);
  }
  return false;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  pruneExpired(now);
  const entry = attempts.get(key);
  const failures = (entry && entry.expiresAt > now ? entry.failures : 0) + 1;
  attempts.set(key, {
    failures,
    lockedUntil: failures >= MAX_FAILURES ? now + LOCKOUT_MS : 0,
    expiresAt: now + ENTRY_TTL_MS,
  });
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}
