import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { JsonLd } from "@/components/seo/JsonLd";
import { FEED_ALTERNATE, breadcrumbSchema } from "@/lib/seo/schema";
import { termsDocument } from "@/lib/legal/terms";
import { SITE_URL } from "@/lib/site";

const pageUrl = `${SITE_URL}/terms`;

export const metadata: Metadata = {
  title: termsDocument.title,
  description: termsDocument.description,
  alternates: { canonical: pageUrl, types: FEED_ALTERNATE },
  openGraph: {
    title: `${termsDocument.title} | כמה נגמר?`,
    description: termsDocument.description,
    url: pageUrl,
    siteName: "כמה נגמר?",
    type: "website",
    locale: "he_IL",
    images: [{ url: "/og-wide.jpg", width: 1200, height: 630, alt: "כמה נגמר? פודקאסט" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${termsDocument.title} | כמה נגמר?`,
    description: termsDocument.description,
    images: ["/og-wide.jpg"],
  },
};

export default function TermsPage() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: termsDocument.title, url: pageUrl },
        ])}
      />
      <LegalDocumentView
        doc={termsDocument}
        relatedHref="/privacy"
        relatedLabel="מדיניות פרטיות"
      />
    </main>
  );
}
