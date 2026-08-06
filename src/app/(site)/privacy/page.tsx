import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { JsonLd } from "@/components/seo/JsonLd";
import { FEED_ALTERNATE, breadcrumbSchema } from "@/lib/seo/schema";
import { privacyDocument } from "@/lib/legal/privacy";
import { SITE_URL } from "@/lib/site";

const pageUrl = `${SITE_URL}/privacy`;

export const metadata: Metadata = {
  title: privacyDocument.title,
  description: privacyDocument.description,
  alternates: { canonical: pageUrl, types: FEED_ALTERNATE },
  openGraph: {
    title: `${privacyDocument.title} | כמה נגמר?`,
    description: privacyDocument.description,
    url: pageUrl,
    siteName: "כמה נגמר?",
    type: "website",
    locale: "he_IL",
    images: [{ url: "/og-wide.jpg", width: 1200, height: 630, alt: "כמה נגמר? פודקאסט" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${privacyDocument.title} | כמה נגמר?`,
    description: privacyDocument.description,
    images: ["/og-wide.jpg"],
  },
};

export default function PrivacyPage() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: privacyDocument.title, url: pageUrl },
        ])}
      />
      <LegalDocumentView
        doc={privacyDocument}
        relatedHref="/terms"
        relatedLabel="תנאי שימוש"
      />
    </main>
  );
}
