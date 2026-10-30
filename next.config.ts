import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel's edge network compresses responses, so Next's own gzip adds
  // nothing there. Where it does run (`next start` on a machine), its gzip
  // stream holds back the end of a streamed Server Action response: a delete
  // or publish toggle in the admin saved but never reached the page.
  compress: false,
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
    // Poll lookups can return null (no main poll), so they get the same
    // bounded TTL instead of "max" to avoid pinning a negative result.
    poll: {
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
  // Baseline hardening on every response. No script-src policy: the site runs
  // PostHog, UserWay and Spotify/YouTube embeds, and a nonce policy would make
  // every page dynamic. Framing, plugins, base and form targets are locked down;
  // Vercel already sends HSTS for the custom domain.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
  // The old production alias still served the whole site at 200 after the move to
  // kama-nigmar.co.il, which is duplicate content. Scoped by host so the per-deployment
  // preview URLs, which have different hostnames, are left alone.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "kama-nigmar-landing.vercel.app" }],
        destination: "https://www.kama-nigmar.co.il/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
