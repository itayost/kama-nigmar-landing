import type { BatchItem, BatchResponse } from "drizzle-orm/batch";

type Queries = Readonly<[BatchItem<"pg">, ...BatchItem<"pg">[]]>;

interface MaybeBatch {
  batch?: (queries: Queries) => Promise<unknown>;
}

// Runs related writes together. Neon's HTTP driver has no transactions but
// commits a batch atomically; the local Docker database has no batch, and
// development does not need the guarantee, so it runs them in order.
export async function runAtomic<T extends Queries>(db: object, queries: T): Promise<BatchResponse<T>> {
  const { batch } = db as MaybeBatch;
  if (typeof batch === "function") {
    return (await batch.call(db, queries)) as BatchResponse<T>;
  }
  const results: unknown[] = [];
  for (const query of queries) results.push(await query);
  return results as BatchResponse<T>;
}
