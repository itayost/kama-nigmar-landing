import { cacheLife, cacheTag } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { pollVotes, polls, type Poll } from "@/lib/db/schema";

export async function getActivePoll(): Promise<Poll | null> {
  "use cache";
  cacheLife("max");
  cacheTag("polls");
  const rows = await getDb()
    .select()
    .from(polls)
    .where(eq(polls.status, "active"))
    .orderBy(desc(polls.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export interface PollWithVotes extends Poll {
  readonly votes: Readonly<Record<string, number>>;
  readonly totalVotes: number;
}

export async function listPolls(): Promise<PollWithVotes[]> {
  await requireAdmin();
  const db = getDb();
  const [allPolls, allVotes] = await Promise.all([
    db.select().from(polls).orderBy(desc(polls.createdAt)),
    db.select().from(pollVotes),
  ]);
  return allPolls.map((poll) => {
    const votes = Object.fromEntries(
      allVotes
        .filter((vote) => vote.pollId === poll.id)
        .map((vote) => [vote.optionId, vote.count]),
    );
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    return { ...poll, votes, totalVotes };
  });
}
