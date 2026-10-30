import { sql } from "drizzle-orm";
import { rowsOf, type Executor } from "@/lib/db/rows";

export interface Limit {
  readonly max: number;
  readonly windowSeconds: number;
}

// A fixed-window counter in Postgres, shared by every serverless instance:
// one statement opens a window or counts a hit in the current one.
// Says whether this hit is within the limit.
export async function consume(db: Executor, key: string, limit: Limit): Promise<boolean> {
  const result = await db.execute(sql`
    insert into rate_limits (key, hits, window_ends_at)
    values (${key}, 1, now() + (${limit.windowSeconds})::int * interval '1 second')
    on conflict (key) do update set
      hits = case when rate_limits.window_ends_at <= now() then 1 else rate_limits.hits + 1 end,
      window_ends_at = case
        when rate_limits.window_ends_at <= now() then excluded.window_ends_at
        else rate_limits.window_ends_at
      end
    returning hits`);
  return Number(rowsOf(result)[0]?.hits) <= limit.max;
}

export async function reset(db: Executor, key: string): Promise<void> {
  await db.execute(sql`delete from rate_limits where key = ${key}`);
}

// Ended windows are dead weight; callers prune now and then.
export async function prune(db: Executor): Promise<void> {
  await db.execute(sql`delete from rate_limits where window_ends_at <= now()`);
}
