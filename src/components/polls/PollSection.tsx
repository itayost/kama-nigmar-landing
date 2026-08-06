import { getMainPoll } from "@/lib/dal/polls";
import type { Poll } from "@/lib/db/schema";
import type { PollPlacement } from "@/lib/polls/schema";
import { PollWidget } from "./PollWidget";

interface PollSectionProps {
  readonly placement: PollPlacement;
  // Explicit poll (an article's linked poll); when absent, the main poll renders.
  readonly poll?: Poll;
}

export async function PollSection({ placement, poll }: PollSectionProps) {
  const resolved = poll ?? (await getMainPoll());
  if (!resolved) return null;

  return (
    <section aria-label="סקר" className="mt-4">
      <PollWidget
        pollId={resolved.id}
        question={resolved.question}
        options={resolved.options}
        placement={placement}
      />
    </section>
  );
}
