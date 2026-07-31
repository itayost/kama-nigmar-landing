import { getActivePoll } from "@/lib/dal/polls";
import { PollWidget } from "./PollWidget";

export async function PollSection() {
  const poll = await getActivePoll();
  if (!poll) return null;

  return (
    <section aria-label="הסקר היומי" className="mt-4">
      <PollWidget pollId={poll.id} question={poll.question} options={poll.options} />
    </section>
  );
}
