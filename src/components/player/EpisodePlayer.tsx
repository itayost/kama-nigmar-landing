import { SectionHeading } from "@/components/ui/SectionHeading";

interface EpisodePlayerProps {
  readonly spotifyShowId: string;
  readonly applePodcastUrl: string;
}

export function EpisodePlayer({ spotifyShowId, applePodcastUrl }: EpisodePlayerProps) {
  return (
    <section aria-labelledby="latest-episode-heading" className="w-full">
      <SectionHeading title="הפרק האחרון" id="latest-episode-heading" />
      <iframe
        title="האזינו בספוטיפיי"
        src={`https://open.spotify.com/embed/show/${spotifyShowId}?theme=0`}
        width="100%"
        height="152"
        allow="encrypted-media"
        loading="lazy"
        className="rounded-xl border-0"
      />
      <p className="mt-3 text-sm text-text-muted">
        זמין גם ב
        <a
          href={applePodcastUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 transition-colors hover:text-white"
        >
          אפל פודקאסטס
        </a>
      </p>
    </section>
  );
}
