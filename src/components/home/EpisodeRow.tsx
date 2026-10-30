import { EpisodeDuration, episodePlayLabel, EpisodeTitle } from "@/components/player/EpisodeTitle";
import type { Episode } from "@/lib/podcast/episode";
import { EpisodePlayButton } from "./EpisodePlayButton";
import { PlayerDock } from "./PlayerDock";

interface EpisodeRowProps {
  // Null when the feed is unavailable: the row still plays the show.
  readonly episode: Episode | null;
  readonly spotifyUrl: string;
  readonly applePodcastUrl: string;
}

// The latest episode on the top edge of the homepage's sheet.
export function EpisodeRow({ episode, spotifyUrl, applePodcastUrl }: EpisodeRowProps) {
  const duration = episode?.durationSeconds ?? null;
  return (
    <section data-player-stand-in aria-label="הפרק האחרון" className="border-b border-surface-border">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-5 py-4 md:gap-4 md:px-6 md:py-[1.0625rem]">
        <EpisodePlayButton playLabel={episodePlayLabel(episode)} spotifyUrl={spotifyUrl} />
        <div className="min-w-0 flex-1 md:flex md:items-center md:gap-4">
          <p className="text-[0.95rem] leading-snug font-extrabold md:shrink-0 md:text-base">
            <EpisodeTitle episode={episode} />
          </p>
          {episode?.description ? (
            <p className="truncate text-[0.8rem] leading-relaxed text-text-muted md:min-w-0 md:flex-1 md:text-sm">
              {episode.description}
            </p>
          ) : null}
        </div>
        {duration ? <EpisodeDuration seconds={duration} className="text-[0.8rem]" /> : null}
        <span className="hidden shrink-0 items-center gap-1.5 text-[0.8rem] text-text-muted md:flex">
          <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
            Spotify
          </a>
          <span aria-hidden="true">·</span>
          <a href={applePodcastUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
            Apple Podcasts
          </a>
        </span>
        <PlayerDock />
      </div>
    </section>
  );
}
