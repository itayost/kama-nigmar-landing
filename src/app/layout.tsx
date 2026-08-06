import type { Metadata } from "next";
import Script from "next/script";
import { Heebo } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
});

const siteUrl = SITE_URL;

const siteDescription =
  "פודקאסט ספורט יומי ומהיר — התקציר של כל מה שקרה אתמול בספורט: ליגת העל, כדורגל אירופאי, NBA ועוד. פרק חדש כל בוקר בספוטיפיי ובאפל פודקאסטס.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "כמה נגמר? | התקציר היומי שלכם",
    template: "%s | כמה נגמר?",
  },
  description: siteDescription,
  // Brand-level fallbacks. Canonical and og:url are deliberately NOT set here:
  // in the root layout they would apply to every page that does not override
  // them, marking inner pages as duplicates of the homepage.
  openGraph: {
    title: "כמה נגמר? | התקציר היומי שלכם",
    description: siteDescription,
    siteName: "כמה נגמר?",
    images: [{ url: "/og-wide.jpg", width: 1200, height: 630, alt: "כמה נגמר? פודקאסט" }],
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "כמה נגמר? | התקציר היומי שלכם",
    description: siteDescription,
    images: ["/og-wide.jpg"],
  },
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-heebo antialiased">
        {children}
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="7ek953Xjr7"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
