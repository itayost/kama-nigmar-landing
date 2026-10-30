import { Wordmark } from "@/components/layout/Wordmark";
import { splitShowQuestion } from "@/lib/articles/title";
import { formatDuration, type Episode } from "@/lib/podcast/episode";

// The latest episode's title, shared by the homepage's episode row and the
// Player bar. Titles open with the show's question, drawn as the wordmark;
// with no episode (the feed is down) it names the latest one generically.
export function EpisodeTitle({ episode }: { readonly episode: Episode | null }) {
  if (!episode) {
    return (
      <>
        <Wordmark /> <span className="font-bold text-white/80">הפרק האחרון</span>
      </>
    );
  }
  const rest = splitShowQuestion(episode.title);
  if (rest === null) return <>{episode.title}</>;
  return (
    <>
      <Wordmark /> <bdi>{rest}</bdi>
    </>
  );
}

// What a play button says to screen readers.
export function episodePlayLabel(episode: Episode | null): string {
  return episode ? `נגן את הפרק ${episode.title}` : "נגן את הפרק האחרון";
}

// The episode's length, as a machine-readable duration.
export function EpisodeDuration({ seconds, className = "" }: { readonly seconds: number; readonly className?: string }) {
  return (
    <time dateTime={`PT${seconds}S`} dir="ltr" className={`shrink-0 text-text-muted tabular-nums ${className}`}>
      {formatDuration(seconds)}
    </time>
  );
}
