import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "כמה נגמר? | פודקאסט ספורט יומי",
  description: "פודקאסט ספורט יומי ומהיר | מה קרה אתמול בעולם הספורט - בארץ ובחו״ל",
  openGraph: {
    title: "כמה נגמר? | פודקאסט ספורט יומי",
    description: "פודקאסט ספורט יומי ומהיר | מה קרה אתמול בעולם הספורט - בארץ ובחו״ל",
    images: [{ url: "/cover.png", width: 1200, height: 1200, alt: "כמה נגמר? פודקאסט" }],
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "כמה נגמר? | פודקאסט ספורט יומי",
    description: "פודקאסט ספורט יומי ומהיר | מה קרה אתמול",
    images: ["/cover.png"],
  },
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
