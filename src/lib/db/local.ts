// The Docker database for local development and e2e (`npm run db:local:up`).
// Test credentials only; it never holds anything but a copy of the site.
export const LOCAL_DATABASE_URL = "postgres://kama:kama@localhost:54329/kama";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isLocalDatabase(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}
