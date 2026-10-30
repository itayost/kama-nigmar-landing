import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedArticles, type ArticleView } from "@/lib/dal/articles";
import { getSubjects } from "@/lib/dal/taxonomy";
import { planHomepage, type HomeSection } from "@/lib/taxonomy/public";
import { ArticleCard } from "./ArticleCard";
import { ArticleLeadCard } from "./ArticleLeadCard";
import { ArticleRow } from "./ArticleRow";
import { RoundupCard } from "./RoundupCard";
import { subjectStyle } from "./subject";

// The front page: the lead story, then one section per subject in the
// admin's order, with the roundups in a strip after the first section.
export async function HomeSections() {
  const [articles, subjects] = await Promise.all([getPublishedArticles(), getSubjects()]);
  const plan = planHomepage(articles, subjects);
  if (!plan.lead) return null;
  const [first, ...others] = plan.sections;

  return (
    <div className="flex w-full flex-col gap-12">
      <section aria-labelledby="lead-heading">
        <SectionHeading title="הסיפור הגדול" id="lead-heading" linkHref="/articles" linkLabel="לכל הכתבות" />
        <ArticleLeadCard article={plan.lead} />
      </section>
      {first ? <SubjectSection section={first} /> : null}
      {plan.roundups.length > 0 ? (
        <section aria-labelledby="roundups-heading">
          <SectionHeading title="סיכומים" id="roundups-heading" color="#ffffff" linkHref="/roundups" linkLabel="לכל הסיכומים" />
          <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
            {plan.roundups.map((article) => (
              <div key={article.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
                <RoundupCard article={article} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {others.map((section) => (
        <SubjectSection key={section.subject.id} section={section} />
      ))}
    </div>
  );
}

function SubjectSection({ section }: { readonly section: HomeSection<ArticleView> }) {
  const { subject, articles, total } = section;
  const href = `/topics/${subject.slug}`;
  const headingId = `section-${subject.slug}`;

  if (section.variant === "compact") {
    const [article] = articles;
    return (
      <section
        aria-labelledby={headingId}
        style={subjectStyle(subject.color)}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-dashed border-white/15 px-4 py-3.5"
      >
        <h2 id={headingId} className="flex items-center gap-2.5 font-extrabold">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px] bg-[var(--subject)]" />
          {subject.name}
        </h2>
        <Link href={`/articles/${article.number}`} className="min-w-0 flex-1 truncate text-sm text-white/75 hover:text-white">
          {article.title}
        </Link>
        <Link href={href} className="text-sm font-semibold text-[var(--subject)] hover:opacity-80">
          {total === 1 ? "לנושא" : `לכל ${total} הכתבות`}
        </Link>
      </section>
    );
  }

  const [main, second, ...rows] = articles;
  return (
    <section aria-labelledby={headingId}>
      <SectionHeading title={subject.name} id={headingId} color={subject.color} linkHref={href} linkLabel={`לכל ${total} הכתבות`} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr]">
        <ArticleCard article={main} phEvent="home_section_click" />
        {second ? <ArticleCard article={second} phEvent="home_section_click" /> : null}
        {rows.length > 0 ? (
          <div className="flex flex-col sm:col-span-2 lg:col-span-1">
            {rows.map((article) => (
              <ArticleRow key={article.id} article={article} phEvent="home_section_click" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
