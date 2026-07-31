import type { Metadata } from "next";
import { Hero } from "@/components/hero/Hero";
import { Divider } from "@/components/ui/Divider";
import { LatestArticlesSection } from "@/components/articles/LatestArticlesSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { FEED_ALTERNATE, podcastSeriesSchema, webSiteSchema } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

const spotifyShowUrl = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL ?? "#";
const applePodcastUrl = process.env.NEXT_PUBLIC_APPLE_PODCAST_URL ?? "#";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL, types: FEED_ALTERNATE },
};

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-6">
      <JsonLd data={webSiteSchema()} />
      <JsonLd
        data={podcastSeriesSchema({ spotifyUrl: spotifyShowUrl, applePodcastUrl })}
      />
      <Hero spotifyUrl={spotifyShowUrl} applePodcastUrl={applePodcastUrl} />
      <Divider />
      <div className="pb-10">
        <LatestArticlesSection />
      </div>
    </main>
  );
}
