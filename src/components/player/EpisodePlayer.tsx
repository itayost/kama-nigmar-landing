interface EpisodePlayerProps {
  readonly spotifyShowId: string;
  readonly applePodcastId: string;
}

export function EpisodePlayer({ spotifyShowId, applePodcastId }: EpisodePlayerProps) {
  return (
    <section aria-labelledby="latest-episode-heading" className="w-full">
      <h2
        id="latest-episode-heading"
        className="mb-4 text-center text-lg font-bold text-white"
      >
        הפרק האחרון
      </h2>
      <div className="flex flex-col items-center gap-6">
        <iframe
          title="האזינו בספוטיפיי"
          src={`https://open.spotify.com/embed/show/${spotifyShowId}?theme=0`}
          width="100%"
          height="152"
          allow="encrypted-media"
          loading="lazy"
          className="rounded-xl border-0"
        />
        <iframe
          title="האזינו באפל פודקאסטס"
          src={`https://embed.podcasts.apple.com/il/podcast/%D7%9B%D7%9E%D7%94-%D7%A0%D7%92%D7%9E%D7%A8/${applePodcastId}`}
          width="100%"
          height="450"
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          loading="lazy"
          className="rounded-xl border-0"
          style={{ maxWidth: "660px" }}
        />
      </div>
    </section>
  );
}
