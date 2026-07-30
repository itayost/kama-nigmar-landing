import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      new URL("https://*.public.blob.vercel-storage.com/**"),
      new URL("https://i.ytimg.com/**"),
    ],
  },
};

export default nextConfig;
