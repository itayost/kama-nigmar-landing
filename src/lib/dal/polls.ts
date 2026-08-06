import { cacheLife, cacheTag } from "next/cache";
import { count, desc, eq, ne, notExists, or, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { articles, pollVotes, polls, type Poll } from "@/lib/db/schema";

// The site-wide poll: the active poll flagged as main, or (backward compat with
// the pre-linking model) the newest active poll no article has claimed.
export async function getMainPoll(): Promise<Poll | null> {
  "use cache";
  cacheLife("poll");
  cacheTag("polls");
  const db = getDb();
  const unlinked = notExists(
    db.select({ id: articles.id }).from(articles).where(eq(articles.pollId, polls.id)),
  );
  const rows = await db
    .select()
    .from(polls)
    .where(sql`${polls.status} = 'active' and (${or(eq(polls.isMain, true), unlinked)})`)
    .orderBy(desc(polls.isMain), desc(polls.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

// Returns the poll regardless of status so a closed poll never pins a null
// cache entry; callers decide whether a non-active poll should render.
export async function getPollById(id: string): Promise<Poll | null> {
  "use cache";
  cacheLife("poll");
  cacheTag("polls");
  const rows = await getDb().select().from(polls).where(eq(polls.id, id)).limit(1);
  return rows[0] ?? null;
}

export interface PollChoice {
  readonly id: string;
  readonly question: string;
  readonly status: Poll["status"];
}

// Options for the article editor's linked-poll select. Closed polls are
// excluded: they would render nothing on the article anyway.
export async function listPollChoices(): Promise<PollChoice[]> {
  await requireAdmin();
  return getDb()
    .select({ id: polls.id, question: polls.question, status: polls.status })
    .from(polls)
    .where(ne(polls.status, "closed"))
    .orderBy(desc(polls.createdAt));
}

export interface PollWithVotes extends Poll {
  readonly votes: Readonly<Record<string, number>>;
  readonly totalVotes: number;
  readonly linkedArticleCount: number;
}

export async function listPolls(): Promise<PollWithVotes[]> {
  await requireAdmin();
  const db = getDb();
  const [allPolls, allVotes, linkCounts] = await Promise.all([
    db.select().from(polls).orderBy(desc(polls.createdAt)),
    db.select().from(pollVotes),
    db
      .select({ pollId: articles.pollId, linked: count() })
      .from(articles)
      .where(sql`${articles.pollId} is not null`)
      .groupBy(articles.pollId),
  ]);
  return allPolls.map((poll) => {
    const votes = Object.fromEntries(
      allVotes
        .filter((vote) => vote.pollId === poll.id)
        .map((vote) => [vote.optionId, vote.count]),
    );
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    const linkedArticleCount =
      linkCounts.find((row) => row.pollId === poll.id)?.linked ?? 0;
    return { ...poll, votes, totalVotes, linkedArticleCount };
  });
}
