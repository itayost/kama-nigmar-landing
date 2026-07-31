import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PlayerBar } from "@/components/player/PlayerBar";

const spotifyShowUrl = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL ?? "#";
const spotifyShowId = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_ID ?? "";
const applePodcastUrl = process.env.NEXT_PUBLIC_APPLE_PODCAST_URL ?? "#";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader spotifyUrl={spotifyShowUrl} />
      {/* Bottom padding keeps content and footer clear of the fixed Player bar. */}
      <div className="pb-28">
        {children}
        <SiteFooter spotifyUrl={spotifyShowUrl} applePodcastUrl={applePodcastUrl} />
      </div>
      <PlayerBar spotifyShowId={spotifyShowId} />
      <Suspense fallback={null}>
        <AnalyticsProvider />
      </Suspense>
    </>
  );
}
