import { describe, expect, it } from "vitest";
import { htmlToText, parseDuration, parseLatestEpisode, readFirstItem } from "./feed";

const NBSP = " ";

function feed(items: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title><![CDATA[כמה נגמר ?]]></title>
    ${items}
  </channel>
</rss>`;
}

const LATEST = `<item>
  <title><![CDATA[כמה נגמר ? 23.10.2011]]></title>
  <description><![CDATA[<p>הדרבי של מנצ&#39;סטר &amp; גיבור המשחק</p>
<p>וגם   השאר.</p>]]></description>
  <link>https://podcasters.spotify.com/pod/show/x/episodes/23-10-2011-e3qu6tg</link>
  <pubDate>Thu, 22 Oct 2026 21:42:37 GMT</pubDate>
  <itunes:duration>00:14:09</itunes:duration>
</item>`;

const OLDER = `<item>
  <title><![CDATA[כמה נגמר? 14.10.92]]></title>
  <description><![CDATA[<p>פרק קודם</p>]]></description>
  <pubDate>Wed, 14 Oct 2026 10:02:10 GMT</pubDate>
  <itunes:duration>987</itunes:duration>
</item>`;

describe("parseLatestEpisode", () => {
  it("reads the first item of the feed", () => {
    expect(parseLatestEpisode(feed(LATEST + OLDER))).toEqual({
      title: `כמה נגמר${NBSP}? 23.10.2011`,
      description: "הדרבי של מנצ'סטר & גיבור המשחק וגם השאר.",
      durationSeconds: 849,
    });
  });

  it("reads a feed with a single item", () => {
    expect(parseLatestEpisode(feed(OLDER))?.durationSeconds).toBe(987);
  });

  it("keeps an episode whose length is missing or broken", () => {
    const item = "<item><title>כמה נגמר ? מסי</title><itunes:duration>soon</itunes:duration></item>";
    expect(parseLatestEpisode(feed(item))).toEqual({
      title: `כמה נגמר${NBSP}? מסי`,
      description: "",
      durationSeconds: null,
    });
  });

  it("cuts a long description at a word, well past what a row shows", () => {
    const words = Array.from({ length: 120 }, (_, i) => `מילה${i}`).join(" ");
    const item = `<item><title>כמה נגמר ? 1.1</title><description><![CDATA[<p>${words}</p>]]></description></item>`;
    const description = parseLatestEpisode(feed(item))?.description ?? "";
    expect(description.length).toBeLessThanOrEqual(281);
    expect(description.endsWith("…")).toBe(true);
    expect(words.startsWith(description.slice(0, -1))).toBe(true);
    expect(description.at(-2)).not.toBe(" ");
  });

  it("returns null for a feed with no episodes", () => {
    expect(parseLatestEpisode(feed(""))).toBeNull();
  });

  it("returns null for an episode without a title", () => {
    expect(parseLatestEpisode(feed("<item><pubDate>Thu, 22 Oct 2026 21:42:37 GMT</pubDate></item>"))).toBeNull();
  });

  it("returns null for text that is not a feed", () => {
    expect(parseLatestEpisode("<html><body>Service unavailable</body></html>")).toBeNull();
    expect(parseLatestEpisode("not xml at all")).toBeNull();
  });
});

function streamOf(chunks: readonly string[]) {
  const encoder = new TextEncoder();
  let pulled = 0;
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (pulled === chunks.length) controller.close();
      else controller.enqueue(encoder.encode(chunks[pulled++]));
    },
    cancel() {
      cancelled = true;
    },
  });
  return { stream, pulled: () => pulled, cancelled: () => cancelled };
}

describe("readFirstItem", () => {
  it("stops reading once the first item has arrived", async () => {
    const chunks = ["<rss><channel><item><title>א</ti", "tle></item>", "<item><title>ב</title></item>", "<item>ג</item>", "<item>ד</item>", "</channel></rss>"];
    const source = streamOf(chunks);
    const text = await readFirstItem(source.stream);
    expect(text).toContain("<title>א</title></item>");
    expect(text).not.toContain("ד");
    expect(source.pulled()).toBeLessThan(chunks.length);
    expect(source.cancelled()).toBe(true);
  });

  it("reads to the end of a feed with no items", async () => {
    const source = streamOf(["<rss><channel>", "</channel></rss>"]);
    expect(await readFirstItem(source.stream)).toBe("<rss><channel></channel></rss>");
  });
});

describe("htmlToText", () => {
  it("drops tags and decodes named and numeric entities", () => {
    expect(htmlToText("<p>A &amp; B &lt;3 &quot;x&quot; &#39;y&#x27; &nbsp;z</p>")).toBe(`A & B <3 "x" 'y' z`);
  });

  it("turns block breaks into spaces and collapses whitespace", () => {
    expect(htmlToText("<p>one</p><p>two<br/>three</p>\n\n")).toBe("one two three");
  });

  it("leaves an unknown entity as written", () => {
    expect(htmlToText("a &bogus; b")).toBe("a &bogus; b");
  });
});

describe("parseDuration", () => {
  it("reads hours, minutes and seconds", () => {
    expect(parseDuration("00:14:09")).toBe(849);
    expect(parseDuration("1:02:03")).toBe(3723);
  });

  it("reads minutes and seconds", () => {
    expect(parseDuration("6:23")).toBe(383);
  });

  it("reads plain seconds, as text or as a number", () => {
    expect(parseDuration("987")).toBe(987);
    expect(parseDuration(987)).toBe(987);
  });

  it("returns null for anything else", () => {
    expect(parseDuration("")).toBeNull();
    expect(parseDuration("soon")).toBeNull();
    expect(parseDuration("1:2:3:4")).toBeNull();
    expect(parseDuration(undefined)).toBeNull();
    expect(parseDuration(0)).toBeNull();
  });
});
