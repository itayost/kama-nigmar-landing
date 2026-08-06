"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { polls } from "@/lib/db/schema";
import { pollInputSchema } from "@/lib/polls/schema";
import { isUuid } from "@/lib/uuid";

export interface PollFormState {
  readonly error?: string;
}

export async function createPoll(
  _prev: PollFormState,
  formData: FormData,
): Promise<PollFormState> {
  await requireAdmin();
  const optionLabels = formData
    .getAll("option")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  const parsed = pollInputSchema.safeParse({
    question: formData.get("question"),
    optionLabels,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await getDb().insert(polls).values({
    question: parsed.data.question,
    options: parsed.data.optionLabels.map((label) => ({ id: randomUUID(), label })),
  });

  updateTag("polls");
  return {};
}

async function findPollId(formData: FormData): Promise<string | null> {
  const id = formData.get("id");
  return typeof id === "string" && isUuid(id) ? id : null;
}

// Any number of polls may be active: article-linked polls run alongside the
// main one. Which poll renders where is decided at read time in the DAL.
export async function activatePoll(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = await findPollId(formData);
  if (!id) return;

  await getDb().update(polls).set({ status: "active" }).where(eq(polls.id, id));
  updateTag("polls");
}

// At most one poll is main (homepage + article fallback): flagging one clears
// the others. Two statements without a transaction (neon-http): the worst case
// is a momentary window with no main poll, which just renders nothing.
export async function setMainPoll(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = await findPollId(formData);
  if (!id) return;

  const db = getDb();
  await db.update(polls).set({ isMain: false }).where(eq(polls.isMain, true));
  await db.update(polls).set({ isMain: true }).where(eq(polls.id, id));
  updateTag("polls");
}

export async function closePoll(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = await findPollId(formData);
  if (!id) return;

  await getDb().update(polls).set({ status: "closed" }).where(eq(polls.id, id));
  updateTag("polls");
}

export async function deletePoll(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = await findPollId(formData);
  if (!id) return;

  await getDb().delete(polls).where(eq(polls.id, id));
  updateTag("polls");
}
