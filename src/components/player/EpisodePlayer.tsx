interface EpisodePlayerProps {
  readonly showId: string;
}

export function EpisodePlayer({ showId }: EpisodePlayerProps) {
  return (
    <section aria-labelledby="latest-episode-heading" className="w-full">
      <h2
        id="latest-episode-heading"
        className="mb-4 text-lg font-bold text-white"
      >
        הפרק האחרון
      </h2>
      <iframe
        title="נגן הפרק האחרון של כמה נגמר?"
        src={`https://open.spotify.com/embed/show/${showId}?theme=0`}
        width="100%"
        height="152"
        allow="encrypted-media"
        loading="lazy"
        className="rounded-xl border-0"
      />
    </section>
  );
}
