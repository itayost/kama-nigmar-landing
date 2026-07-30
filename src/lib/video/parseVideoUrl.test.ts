import { describe, expect, test } from "vitest";
import { parseVideoUrl } from "./parseVideoUrl";

const YT_ID = "dQw4w9WgXcQ";
const YT_EMBED = `https://www.youtube-nocookie.com/embed/${YT_ID}`;
const YT_THUMB = `https://i.ytimg.com/vi/${YT_ID}/hqdefault.jpg`;

describe("parseVideoUrl - YouTube", () => {
  test("parses a standard watch URL", () => {
    expect(parseVideoUrl(`https://www.youtube.com/watch?v=${YT_ID}`)).toEqual({
      provider: "youtube",
      embedUrl: YT_EMBED,
      thumbnailUrl: YT_THUMB,
    });
  });

  test("parses watch URL with extra query params", () => {
    const result = parseVideoUrl(
      `https://www.youtube.com/watch?v=${YT_ID}&t=42s&list=PLx`,
    );
    expect(result?.embedUrl).toBe(YT_EMBED);
  });

  test("parses youtu.be short links", () => {
    expect(parseVideoUrl(`https://youtu.be/${YT_ID}`)?.provider).toBe("youtube");
    expect(parseVideoUrl(`https://youtu.be/${YT_ID}?si=abc`)?.embedUrl).toBe(YT_EMBED);
  });

  test("parses shorts, embed and live paths", () => {
    expect(parseVideoUrl(`https://www.youtube.com/shorts/${YT_ID}`)?.embedUrl).toBe(YT_EMBED);
    expect(parseVideoUrl(`https://www.youtube.com/embed/${YT_ID}`)?.embedUrl).toBe(YT_EMBED);
    expect(parseVideoUrl(`https://www.youtube.com/live/${YT_ID}`)?.embedUrl).toBe(YT_EMBED);
  });

  test("parses mobile and bare hosts", () => {
    expect(parseVideoUrl(`https://m.youtube.com/watch?v=${YT_ID}`)?.provider).toBe("youtube");
    expect(parseVideoUrl(`https://youtube.com/watch?v=${YT_ID}`)?.provider).toBe("youtube");
  });

  test("accepts http as well as https", () => {
    expect(parseVideoUrl(`http://www.youtube.com/watch?v=${YT_ID}`)?.provider).toBe("youtube");
  });

  test("rejects invalid video IDs", () => {
    expect(parseVideoUrl("https://www.youtube.com/watch?v=short")).toBeNull();
    expect(parseVideoUrl("https://www.youtube.com/watch?v=")).toBeNull();
    expect(parseVideoUrl("https://youtu.be/way-too-long-to-be-an-id")).toBeNull();
  });

  test("rejects lookalike hosts", () => {
    expect(parseVideoUrl(`https://evil-youtube.com/watch?v=${YT_ID}`)).toBeNull();
    expect(parseVideoUrl(`https://youtube.com.evil.com/watch?v=${YT_ID}`)).toBeNull();
  });
});

describe("parseVideoUrl - Instagram", () => {
  test("parses post, reel and reels URLs", () => {
    const expected = {
      provider: "instagram",
      embedUrl: "https://www.instagram.com/p/Cxyz123_ab/embed/",
    };
    expect(parseVideoUrl("https://www.instagram.com/p/Cxyz123_ab/")).toEqual(expected);
    expect(parseVideoUrl("https://www.instagram.com/reel/Cxyz123_ab")).toEqual(expected);
    expect(parseVideoUrl("https://instagram.com/reels/Cxyz123_ab/")).toEqual(expected);
  });

  test("has no thumbnail", () => {
    expect(
      parseVideoUrl("https://www.instagram.com/reel/Cxyz123_ab/")?.thumbnailUrl,
    ).toBeUndefined();
  });

  test("rejects profile and unknown paths", () => {
    expect(parseVideoUrl("https://www.instagram.com/someuser/")).toBeNull();
    expect(parseVideoUrl("https://www.instagram.com/stories/user/123/")).toBeNull();
  });
});

describe("parseVideoUrl - TikTok", () => {
  test("parses a full video URL", () => {
    expect(
      parseVideoUrl("https://www.tiktok.com/@someuser/video/7291234567891234567"),
    ).toEqual({
      provider: "tiktok",
      embedUrl: "https://www.tiktok.com/embed/v2/7291234567891234567",
    });
  });

  test("rejects short links that need a network hop", () => {
    expect(parseVideoUrl("https://vm.tiktok.com/ZM8abcdef/")).toBeNull();
    expect(parseVideoUrl("https://vt.tiktok.com/ZM8abcdef/")).toBeNull();
  });

  test("rejects non-video tiktok paths", () => {
    expect(parseVideoUrl("https://www.tiktok.com/@someuser")).toBeNull();
    expect(parseVideoUrl("https://www.tiktok.com/@someuser/video/not-a-number")).toBeNull();
  });
});

describe("parseVideoUrl - Spotify", () => {
  const EPISODE_ID = "4rOoJ6Egrf8K2IrywzwOMk";

  test("parses an episode URL", () => {
    expect(parseVideoUrl(`https://open.spotify.com/episode/${EPISODE_ID}`)).toEqual({
      provider: "spotify",
      embedUrl: `https://open.spotify.com/embed/episode/${EPISODE_ID}?theme=0`,
    });
  });

  test("strips locale prefixes like /intl-he/", () => {
    expect(
      parseVideoUrl(`https://open.spotify.com/intl-he/episode/${EPISODE_ID}?si=x`)?.embedUrl,
    ).toBe(`https://open.spotify.com/embed/episode/${EPISODE_ID}?theme=0`);
  });

  test("rejects tracks, shows and playlists", () => {
    expect(parseVideoUrl(`https://open.spotify.com/track/${EPISODE_ID}`)).toBeNull();
    expect(parseVideoUrl(`https://open.spotify.com/show/${EPISODE_ID}`)).toBeNull();
    expect(parseVideoUrl(`https://open.spotify.com/playlist/${EPISODE_ID}`)).toBeNull();
  });

  test("rejects malformed episode IDs", () => {
    expect(parseVideoUrl("https://open.spotify.com/episode/short")).toBeNull();
  });
});

describe("parseVideoUrl - garbage input", () => {
  test("returns null for non-URLs and unsupported input", () => {
    expect(parseVideoUrl("")).toBeNull();
    expect(parseVideoUrl("not a url")).toBeNull();
    expect(parseVideoUrl("ftp://youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseVideoUrl("https://example.com/video/123")).toBeNull();
    expect(parseVideoUrl("javascript:alert(1)")).toBeNull();
  });

  test("trims surrounding whitespace", () => {
    expect(parseVideoUrl(`  https://youtu.be/${YT_ID}  `)?.provider).toBe("youtube");
  });
});
