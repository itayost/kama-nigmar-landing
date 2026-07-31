import { parseVideoUrl } from "@/lib/video/parseVideoUrl";
import { VideoFacade } from "./VideoFacade";

interface EpisodeCalloutProps {
  readonly url: string;
}

// "Listen to the Episode about this story" - renders the click-to-play
// Spotify facade for the Episode an Article is based on.
export function EpisodeCallout({ url }: EpisodeCalloutProps) {
  const parsed = parseVideoUrl(url);
  if (parsed?.provider !== "spotify") return null;

  return (
    <aside
      aria-label="האזינו לפרק על הסיפור הזה"
      className="rounded-xl border border-accent/25 bg-surface/50 p-4"
    >
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-accent">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-[3px] bg-accent shadow-[0_0_10px_rgba(46,204,64,0.6)]"
        />
        האזינו לפרק על הסיפור הזה
      </p>
      <VideoFacade
        block={{
          id: "episode-callout",
          type: "video",
          provider: "spotify",
          url,
          embedUrl: parsed.embedUrl,
        }}
      />
    </aside>
  );
}
