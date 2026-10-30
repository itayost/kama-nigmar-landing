import type { SQL } from "drizzle-orm";

// Any drizzle database, for code that only runs raw SQL: Neon HTTP, node-postgres
// and PGlite in tests all fit.
export interface Executor {
  execute(query: SQL): PromiseLike<unknown>;
}

// The rows of a raw query, whichever driver ran it: some return the array,
// others a result object carrying it.
export function rowsOf(result: unknown): Record<string, unknown>[] {
  const rows = Array.isArray(result) ? result : (result as { rows?: unknown } | null)?.rows;
  return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
}
