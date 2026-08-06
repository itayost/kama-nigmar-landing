import { NewPollForm } from "@/components/admin/polls/NewPollForm";
import { PollRow } from "@/components/admin/polls/PollRow";
import { listPolls } from "@/lib/dal/polls";

export default async function AdminPollsPage() {
  const polls = await listPolls();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">סקרים</h2>
      <NewPollForm />
      {polls.length === 0 ? (
        <p className="rounded-xl border border-dashed border-surface-border p-12 text-center text-text-muted">
          עדיין אין סקרים — צרו סקר, לחצו הפעלה, ובחרו &quot;הצגה בעמוד הבית&quot; כדי
          שיופיע בעמוד הבית ובכתבות. קישור סקר לכתבה מסוימת נעשה מעורך הכתבה
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {polls.map((poll) => (
            <PollRow
              key={poll.id}
              id={poll.id}
              question={poll.question}
              options={poll.options}
              status={poll.status}
              isMain={poll.isMain}
              linkedArticleCount={poll.linkedArticleCount}
              votes={poll.votes}
              totalVotes={poll.totalVotes}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
