import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Article reads are invalidated instantly by updateTag() on admin save, so the
  // TTL is only a safety net. It exists because "max" (revalidate 30 days) let a
  // single stale or negative lookup pin a wrong result for weeks.
  cacheLife: {
    article: {
      stale: 60 * 5,
      revalidate: 60 * 60,
      expire: 60 * 60 * 24,
    },
  },
  images: {
    remotePatterns: [
      new URL("https://*.public.blob.vercel-storage.com/**"),
      new URL("https://i.ytimg.com/**"),
    ],
  },
};

export default nextConfig;
