interface PlayerBarProps {
  readonly spotifyShowId: string;
}

// Persistent site-wide Player bar (see CONTEXT.md). An RSC is enough: the
// (site) layout never remounts on client navigation, so the iframe - and
// its playback - survives moving between pages.
export function PlayerBar({ spotifyShowId }: PlayerBarProps) {
  if (spotifyShowId === "") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-border bg-bg-start/95 backdrop-blur-md">
      <div className="mx-auto w-full max-w-5xl px-4 py-2">
        <iframe
          title="נגן הפרק האחרון"
          src={`https://open.spotify.com/embed/show/${spotifyShowId}?theme=0`}
          width="100%"
          height="80"
          allow="encrypted-media"
          loading="lazy"
          className="rounded-lg border-0"
        />
      </div>
    </div>
  );
}
