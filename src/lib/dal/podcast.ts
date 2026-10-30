import { cacheLife } from "next/cache";
import { parseLatestEpisode, readFirstItem, type Episode } from "@/lib/podcast/feed";

// The show's RSS feed, as its Apple Podcasts listing names it. PODCAST_FEED_URL
// overrides it, and an empty value switches the feed off: E2E runs do that so
// they never depend on the network.
const DEFAULT_FEED_URL = "https://anchor.fm/s/111c8a8e0/podcast/rss";
const FEED_TIMEOUT_MS = 5000;

// The latest Episode, or null when the feed is off, down or unreadable; the
// page then offers the show without naming an episode.
export async function getLatestEpisode(): Promise<Episode | null> {
  const url = process.env.PODCAST_FEED_URL ?? DEFAULT_FEED_URL;
  if (!url) return null;
  try {
    return await fetchLatestEpisode(url);
  } catch (error) {
    console.error("Podcast feed unavailable", error);
    return null;
  }
}

// A failed fetch throws, and errors are never cached, so the next render
// tries the feed again instead of keeping the outage for an hour.
async function fetchLatestEpisode(url: string): Promise<Episode | null> {
  "use cache";
  cacheLife("hours");
  const response = await fetch(url, { signal: AbortSignal.timeout(FEED_TIMEOUT_MS) });
  if (!response.ok || !response.body) throw new Error(`Podcast feed responded ${response.status}`);
  return parseLatestEpisode(await readFirstItem(response.body));
}
