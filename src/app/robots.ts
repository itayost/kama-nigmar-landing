import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Generated rather than a static public/robots.txt so the sitemap URL follows
// SITE_URL. The static file kept advertising the old vercel.app sitemap for the
// whole domain move without anything catching it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
