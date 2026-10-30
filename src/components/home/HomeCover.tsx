import Link from "next/link";
import { AuthorAvatar } from "@/components/articles/AuthorAvatar";
import { CoverImage, LEAD_PLACEHOLDER, SubjectKicker, subjectStyle } from "@/components/articles/subject";
import { ForwardArrow } from "@/components/ui/ForwardArrow";
import { minutesLabel } from "@/lib/articles/reading-time";
import type { ArticleView } from "@/lib/dal/articles";
import { formatDateLong } from "@/lib/datetime";

// The homepage opens on its lead story, full bleed like an article's cover,
// and the sheet with the rest of the page rides up over it. The whole cover
// is one link; the white button says so (white reads, green listens).
export function HomeCover({ article }: { readonly article: ArticleView }) {
  return (
    <Link
      href={`/articles/${article.number}`}
      aria-labelledby="cover-title cover-cta"
      data-ph-event="home_cover_click"
      data-ph-slug={article.number}
      style={subjectStyle(article.subject?.color)}
      className="group sticky top-0 block h-[76svh] min-h-[30rem] overflow-hidden bg-bg-start [--focus-offset:-4px] md:h-[72vh] md:min-h-[34rem]"
    >
      <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transform-none">
        <CoverImage
          article={article}
          sizes="100vw"
          priority
          className="cover-photo"
          placeholderClassName={LEAD_PLACEHOLDER}
          labelClassName="-translate-y-1/2 text-[clamp(4rem,2rem+8vw,8rem)] font-black text-white/5"
        />
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,24,0.97)_0%,rgba(6,13,24,0.6)_46%,transparent_76%)] md:bg-[linear-gradient(to_top,rgba(6,13,24,0.96)_0%,rgba(6,13,24,0.55)_36%,transparent_64%),linear-gradient(to_left,rgba(6,13,24,0.55)_0%,transparent_55%)]"
      />
      <div className="cover-headline absolute inset-x-0 bottom-[calc(var(--sheet-overlap)+1.5rem)] md:bottom-[calc(var(--sheet-overlap)+2.5rem)]">
        <div className="mx-auto flex max-w-5xl flex-col items-start px-6">
          <SubjectKicker subject={article.subject} format={article.format} className="mb-3 text-xs" />
          <h2
            id="cover-title"
            className="mb-3 text-[clamp(1.9rem,1.25rem+2.9vw,3.4rem)] leading-[1.08] font-black text-balance decoration-white/55 decoration-[3px] underline-offset-[10px] [text-shadow:0_2px_18px_rgba(0,0,0,0.45)] group-hover:underline md:max-w-[18ch]"
          >
            {article.title}
          </h2>
          {article.subtitle ? (
            <p className="mb-5 hidden max-w-[52ch] text-[1.05rem] leading-relaxed text-white/80 md:block">{article.subtitle}</p>
          ) : null}
          <div className="mt-1 flex flex-col-reverse items-start gap-4 md:mt-0 md:flex-row md:items-center md:gap-5">
            <span
              id="cover-cta"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white ps-5 pe-[1.125rem] text-[0.95rem] font-extrabold text-bg-start shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] transition-[scale,background-color] duration-200 group-active:scale-[0.97] group-active:bg-[#e3e8ef] motion-reduce:transition-none md:h-[2.875rem]"
            >
              לקריאת הכתבה
              <ForwardArrow className="h-[1.125rem] w-[1.125rem]" />
            </span>
            {/* Each part keeps to one line; the narrowest phones drop the date. */}
            <span className="flex items-center gap-2 text-xs whitespace-nowrap text-white/75 md:text-[0.8rem]">
              <AuthorAvatar name={article.authorName} size={22} />
              <span>{article.authorName}</span>
              {article.publishedAt ? (
                <span className="hidden items-center gap-2 min-[360px]:flex">
                  <span aria-hidden="true">·</span>
                  <time dateTime={article.publishedAt.toISOString()}>{formatDateLong(article.publishedAt)}</time>
                </span>
              ) : null}
              <span aria-hidden="true">·</span>
              <span>{minutesLabel(article.readingMinutes)}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
