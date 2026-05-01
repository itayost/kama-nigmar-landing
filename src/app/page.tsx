import { Hero } from "@/components/hero/Hero";
import { Divider } from "@/components/ui/Divider";
import { EpisodePlayer } from "@/components/player/EpisodePlayer";

const spotifyShowUrl = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL ?? "#";
const spotifyShowId = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_ID ?? "";
const applePodcastUrl = process.env.NEXT_PUBLIC_APPLE_PODCAST_URL ?? "#";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col items-center px-6 py-12 md:py-20">
      <main className="flex w-full max-w-3xl flex-col items-center gap-2">
        <Hero spotifyUrl={spotifyShowUrl} applePodcastUrl={applePodcastUrl} />
        <Divider />
        <EpisodePlayer showId={spotifyShowId} />
      </main>
      <footer className="mt-auto pt-12 text-center text-sm text-text-muted">
        כמה נגמר? {year}
      </footer>
    </div>
  );
}
