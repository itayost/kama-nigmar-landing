import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeSections } from "@/components/articles/HomeSections";
import { EpisodeRow } from "@/components/home/EpisodeRow";
import { HomeCover } from "@/components/home/HomeCover";
import { CoverSheet } from "@/components/layout/CoverSheet";
import { PollSection } from "@/components/polls/PollSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedArticles } from "@/lib/dal/articles";
import { getLatestEpisode } from "@/lib/dal/podcast";
import { getMainPoll } from "@/lib/dal/polls";
import { getSubjects } from "@/lib/dal/taxonomy";
import { FEED_ALTERNATE, podcastSeriesSchema, webSiteSchema } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";
import { planHomepage } from "@/lib/taxonomy/public";

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
    <div className="mx-auto w-full max-w-2xl px-6 pb-10">
      <PollSection placement="homepage" poll={poll} />
    </div>
  );
}

const PAGE_HEADING = <h1 className="sr-only">כמה נגמר? התקציר היומי שלכם</h1>;

export default async function Home() {
  const [articles, subjects, episode] = await Promise.all([
    getPublishedArticles(),
    getSubjects(),
    getLatestEpisode(),
  ]);
  const plan = planHomepage(articles, subjects);

  const content = (
    <>
      <JsonLd data={webSiteSchema()} />
      <JsonLd data={podcastSeriesSchema({ spotifyUrl: spotifyShowUrl, applePodcastUrl })} />
      <EpisodeRow episode={episode} spotifyUrl={spotifyShowUrl} applePodcastUrl={applePodcastUrl} />
      <div className="mx-auto w-full max-w-5xl px-6 pt-9 pb-10">
        <HomeSections plan={plan} />
      </div>
      <Suspense fallback={null}>
        <HomePollSlot />
      </Suspense>
    </>
  );

  // With no story yet there is no cover, and the content stands on its own.
  if (!plan.lead) {
    return (
      <main>
        {PAGE_HEADING}
        {content}
      </main>
    );
  }
  // The lead story opens the page as a full-bleed cover under the floating
  // header, and the sheet with everything else rides up over it.
  return (
    <CoverSheet
      cover={
        <>
          {PAGE_HEADING}
          <HomeCover article={plan.lead} />
        </>
      }
      overlapClassName="[--sheet-overlap:1.75rem]"
    >
      {content}
    </CoverSheet>
  );
}
