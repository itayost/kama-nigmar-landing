import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/hero/Hero";
import { PollSection } from "@/components/polls/PollSection";
import { getMainPoll } from "@/lib/dal/polls";
import { LatestArticlesSection } from "@/components/articles/LatestArticlesSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { FEED_ALTERNATE, podcastSeriesSchema, webSiteSchema } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

const spotifyShowUrl = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL ?? "#";
const applePodcastUrl = process.env.NEXT_PUBLIC_APPLE_PODCAST_URL ?? "#";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL, types: FEED_ALTERNATE },
};

// Wraps the poll so its spacing disappears entirely when there is no main
// poll. The widget is designed for the article column width, hence max-w-2xl.
async function HomePollSlot() {
  const poll = await getMainPoll();
  if (!poll) return null;

  return (
    <div className="mx-auto w-full max-w-2xl pt-9">
      <PollSection placement="homepage" poll={poll} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-6">
      <JsonLd data={webSiteSchema()} />
      <JsonLd
        data={podcastSeriesSchema({ spotifyUrl: spotifyShowUrl, applePodcastUrl })}
      />
      <Hero spotifyUrl={spotifyShowUrl} applePodcastUrl={applePodcastUrl} />
      <Suspense fallback={null}>
        <HomePollSlot />
      </Suspense>
      <div className="pb-10 pt-9">
        <LatestArticlesSection />
      </div>
    </main>
  );
}
