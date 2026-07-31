import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { pollVotes, polls } from "@/lib/db/schema";
import { voteInputSchema, type PollResults } from "@/lib/polls/schema";

// Public vote endpoint. Like the view beacon (ADR 0001) it never invalidates
// caches - results are returned in the response, not rendered into pages.
// Double-voting is deterred client-side (localStorage); without accounts
// that is the honest ceiling.
export async function POST(request: Request): Promise<Response> {
  let pollId: string;
  let optionId: string;
  try {
    const body: unknown = await request.json();
    const parsed = voteInputSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(null, { status: 400 });
    }
    ({ pollId, optionId } = parsed.data);
  } catch {
    return new Response(null, { status: 400 });
  }

  const db = getDb();
  const pollRows = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1);
  const poll = pollRows[0];
  if (
    !poll ||
    poll.status !== "active" ||
    !poll.options.some((option) => option.id === optionId)
  ) {
    return new Response(null, { status: 400 });
  }

  await db
    .insert(pollVotes)
    .values({ pollId, optionId, count: 1 })
    .onConflictDoUpdate({
      target: [pollVotes.pollId, pollVotes.optionId],
      set: { count: sql`${pollVotes.count} + 1` },
    });

  const votes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, pollId));
  const results: PollResults = {
    results: votes.map((vote) => ({ optionId: vote.optionId, count: vote.count })),
    total: votes.reduce((sum, vote) => sum + vote.count, 0),
  };
  return Response.json(results);
}
