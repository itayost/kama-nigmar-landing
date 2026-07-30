import type { VideoProvider } from "@/lib/articles/blocks";

export interface ParsedVideo {
  readonly provider: VideoProvider;
  readonly embedUrl: string;
  readonly thumbnailUrl?: string;
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_PATH_PREFIXES = ["shorts", "embed", "live"];

const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);
const INSTAGRAM_PATH_PREFIXES = new Set(["p", "reel", "reels", "tv"]);
const INSTAGRAM_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

const TIKTOK_HOSTS = new Set(["tiktok.com", "www.tiktok.com"]);
const TIKTOK_ID_PATTERN = /^\d+$/;

const SPOTIFY_EPISODE_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

function segmentsOf(url: URL): string[] {
  return url.pathname.split("/").filter(Boolean);
}

function parseYouTube(url: URL): ParsedVideo | null {
  let id: string | undefined;

  if (url.hostname === "youtu.be") {
    id = segmentsOf(url)[0];
  } else if (YOUTUBE_HOSTS.has(url.hostname)) {
    const segments = segmentsOf(url);
    if (segments[0] === "watch") {
      id = url.searchParams.get("v") ?? undefined;
    } else if (segments[0] !== undefined && YOUTUBE_PATH_PREFIXES.includes(segments[0])) {
      id = segments[1];
    }
  }

  if (id === undefined || !YOUTUBE_ID_PATTERN.test(id)) return null;
  return {
    provider: "youtube",
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

function parseInstagram(url: URL): ParsedVideo | null {
  if (!INSTAGRAM_HOSTS.has(url.hostname)) return null;
  const segments = segmentsOf(url);
  if (segments[0] === undefined || !INSTAGRAM_PATH_PREFIXES.has(segments[0])) return null;
  const code = segments[1];
  if (code === undefined || !INSTAGRAM_CODE_PATTERN.test(code)) return null;
  return {
    provider: "instagram",
    embedUrl: `https://www.instagram.com/p/${code}/embed/`,
  };
}

function parseTikTok(url: URL): ParsedVideo | null {
  if (!TIKTOK_HOSTS.has(url.hostname)) return null;
  const segments = segmentsOf(url);
  if (segments.length < 3 || !segments[0].startsWith("@") || segments[1] !== "video") {
    return null;
  }
  const id = segments[2];
  if (!TIKTOK_ID_PATTERN.test(id)) return null;
  return {
    provider: "tiktok",
    embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
  };
}

function parseSpotify(url: URL): ParsedVideo | null {
  if (url.hostname !== "open.spotify.com") return null;
  const segments = segmentsOf(url);
  const withoutLocale = segments[0]?.startsWith("intl-") ? segments.slice(1) : segments;
  if (withoutLocale[0] !== "episode") return null;
  const id = withoutLocale[1];
  if (id === undefined || !SPOTIFY_EPISODE_ID_PATTERN.test(id)) return null;
  return {
    provider: "spotify",
    embedUrl: `https://open.spotify.com/embed/episode/${id}?theme=0`,
  };
}

export function parseVideoUrl(raw: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  return (
    parseYouTube(url) ?? parseInstagram(url) ?? parseTikTok(url) ?? parseSpotify(url)
  );
}
