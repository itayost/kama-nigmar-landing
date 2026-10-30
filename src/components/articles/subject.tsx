import Image from "next/image";
import type { CSSProperties } from "react";
import { FORMAT_LABELS, type ArticleFormat } from "@/lib/taxonomy/format";
import type { SubjectSummary } from "@/lib/taxonomy/public";

// Shared pieces that show which subject an article belongs to.

export function subjectStyle(color: string | null | undefined): CSSProperties {
  return { "--subject": color ?? "var(--color-accent)" } as CSSProperties;
}

// Where the cover crops around: the admin's focal point, or the center.
export function coverPosition(article: { readonly coverFocusX: number | null; readonly coverFocusY: number | null }) {
  return `${article.coverFocusX ?? 50}% ${article.coverFocusY ?? 50}%`;
}

interface CoverImageProps {
  readonly article: {
    readonly coverImageUrl: string | null;
    readonly coverFocusX: number | null;
    readonly coverFocusY: number | null;
  };
  readonly sizes: string;
  readonly className?: string;
  // Replaces the default navy wash behind the wordmark when there is no cover.
  readonly placeholderClassName?: string;
  readonly labelClassName?: string;
  // For the page's largest image: load it first instead of lazily.
  readonly priority?: boolean;
}

// A card's cover, cropped around its focal point, or the wordmark on a wash.
// Fills its positioned parent.
export function CoverImage({
  article,
  sizes,
  className = "",
  placeholderClassName = "bg-gradient-to-br from-bg-start to-bg-end",
  labelClassName = "",
  priority = false,
}: CoverImageProps) {
  if (!article.coverImageUrl) {
    return (
      <span className={`flex h-full w-full items-center justify-center ${placeholderClassName}`}>
        <span className={`font-extrabold text-accent/40 ${labelClassName}`}>כמה נגמר?</span>
      </span>
    );
  }
  return (
    <Image
      src={article.coverImageUrl}
      alt=""
      fill
      sizes={sizes}
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      style={{ objectPosition: coverPosition(article) }}
      className={`object-cover ${className}`}
    />
  );
}

interface KickerProps {
  readonly subject: SubjectSummary | null;
  readonly format: ArticleFormat;
  readonly className?: string;
}

// The label above a headline: the primary subject in its color, or the format
// for a roundup that spans several subjects.
export function SubjectKicker({ subject, format, className = "" }: KickerProps) {
  const label = subject?.name ?? (format === "story" ? null : FORMAT_LABELS[format]);
  if (!label) return null;
  return (
    <span
      style={subject ? subjectStyle(subject.color) : undefined}
      className={`inline-block rounded-md px-2 py-0.5 text-[0.7rem] font-extrabold leading-snug text-bg-start ${
        subject ? "bg-[var(--subject)]" : "bg-white/90"
      } ${className}`}
    >
      {label}
    </span>
  );
}

interface AlsoInProps {
  readonly subject: SubjectSummary | null;
  readonly alsoIn: readonly SubjectSummary[];
}

// "Also in" mark for an article that reaches another subject through a tag:
// two overlapping dots, like an interchange on a line map.
export function AlsoIn({ subject, alsoIn }: AlsoInProps) {
  const other = alsoIn[0];
  if (!subject || !other) return null;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-text-muted">
      <span aria-hidden="true" className="inline-flex">
        <span className="h-2.5 w-2.5 rounded-full ring-2 ring-bg-start" style={{ backgroundColor: subject.color }} />
        <span className="-ms-1 h-2.5 w-2.5 rounded-full ring-2 ring-bg-start" style={{ backgroundColor: other.color }} />
      </span>
      גם ב{other.name}
    </span>
  );
}
