import { describe, expect, test } from "vitest";
import { SITE_URL } from "@/lib/site";
import robots from "./robots";

describe("robots", () => {
  // The static public/robots.txt this replaced kept pointing at the old
  // vercel.app sitemap through an entire domain move. Nothing caught it.
  test("advertises the sitemap on the current site domain", () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  test("keeps admin and api out of the index", () => {
    const { rules } = robots();
    expect(rules).toMatchObject({
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    });
  });
});
