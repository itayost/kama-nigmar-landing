import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
});

const siteUrl = "https://kama-nigmar-landing.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "כמה נגמר? | פודקאסט ספורט יומי",
  description: "כמה נגמר? - התקציר היומי שלכם",
  openGraph: {
    title: "כמה נגמר? | פודקאסט ספורט יומי",
    description: "כמה נגמר? - התקציר היומי שלכם",
    url: siteUrl,
    siteName: "כמה נגמר?",
    images: [{ url: "/cover.png", width: 1200, height: 1200, alt: "כמה נגמר? פודקאסט" }],
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "כמה נגמר? | פודקאסט ספורט יומי",
    description: "כמה נגמר? - התקציר היומי שלכם",
    images: ["/cover.png"],
  },
  alternates: {
    canonical: siteUrl,
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
      </body>
    </html>
  );
}
