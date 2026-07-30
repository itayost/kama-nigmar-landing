import { Hero } from "@/components/hero/Hero";
import { Divider } from "@/components/ui/Divider";
import { EpisodePlayer } from "@/components/player/EpisodePlayer";
import { LatestArticlesSection } from "@/components/articles/LatestArticlesSection";

const spotifyShowUrl = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL ?? "#";
const spotifyShowId = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_ID ?? "";
const applePodcastUrl = process.env.NEXT_PUBLIC_APPLE_PODCAST_URL ?? "#";
const applePodcastId = process.env.NEXT_PUBLIC_APPLE_PODCAST_ID ?? "id1895382563";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-6">
      <Hero spotifyUrl={spotifyShowUrl} applePodcastUrl={applePodcastUrl} />
      <Divider />
      <div className="flex flex-col gap-14 pb-10">
        <EpisodePlayer spotifyShowId={spotifyShowId} applePodcastId={applePodcastId} />
        <LatestArticlesSection />
      </div>
    </main>
  );
}
