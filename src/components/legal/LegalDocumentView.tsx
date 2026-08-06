import Link from "next/link";
import { Fragment } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDateLong } from "@/lib/datetime";
import type { LegalDocument } from "@/lib/legal/document";
import { CONTACT_EMAIL } from "@/lib/site";

// The contact address is written inline in the legal prose (that is how these
// pages read), so it is turned into a mailto link here rather than being split
// out of the sentence in the content modules.
function withMailtoLinks(text: string) {
  const parts = text.split(CONTACT_EMAIL);
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 ? (
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          dir="ltr"
          className="inline-block whitespace-nowrap text-accent underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          {CONTACT_EMAIL}
        </a>
      ) : null}
    </Fragment>
  ));
}

interface LegalDocumentViewProps {
  readonly doc: LegalDocument;
  readonly relatedHref: string;
  readonly relatedLabel: string;
}

export function LegalDocumentView({
  doc,
  relatedHref,
  relatedLabel,
}: LegalDocumentViewProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-10">
      <SectionHeading title={doc.title} as="h1" />
      <p className="-mt-3 text-sm text-text-muted">
        עודכן לאחרונה:{" "}
        <time dateTime={doc.updatedAt}>
          {formatDateLong(new Date(doc.updatedAt))}
        </time>
      </p>

      {doc.intro.map((paragraph) => (
        <p
          key={paragraph}
          className="mt-6 text-[1.15rem] leading-[1.8] text-white"
        >
          {paragraph}
        </p>
      ))}

      <div className="mt-10 flex flex-col gap-9">
        {doc.sections.map((section, index) => (
          <section key={section.heading} className="flex flex-col gap-4">
            <h2 className="flex items-baseline gap-2.5 text-xl font-extrabold">
              {/* dir="ltr" keeps the numeral and its period in that order;
                  inside the RTL heading they would render as ".1". */}
              <span aria-hidden="true" dir="ltr" className="text-accent">
                {index + 1}.
              </span>
              {section.heading}
            </h2>
            {section.body.map((block) =>
              block.type === "paragraph" ? (
                <p
                  key={block.text}
                  className="text-[1.05rem] leading-[1.85] text-white/[0.88]"
                >
                  {withMailtoLinks(block.text)}
                </p>
              ) : (
                <ul
                  key={block.items.join("|")}
                  className="flex list-disc flex-col gap-2.5 ps-5 text-[1.05rem] leading-[1.8] text-white/[0.88] marker:text-accent"
                >
                  {block.items.map((item) => (
                    <li key={item}>{withMailtoLinks(item)}</li>
                  ))}
                </ul>
              ),
            )}
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-surface-border pt-5 text-sm text-text-muted">
        ראו גם:{" "}
        <Link
          href={relatedHref}
          className="font-semibold text-accent transition-opacity hover:opacity-80"
        >
          {relatedLabel}
        </Link>
      </p>
    </article>
  );
}
