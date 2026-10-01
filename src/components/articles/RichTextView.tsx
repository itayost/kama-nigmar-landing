import { Fragment, type ReactNode } from "react";
import { isSafeHref, type InlineMark, type RichText } from "@/lib/articles/rich-text";

const MARK_WRAPPERS: Readonly<Record<InlineMark, (children: ReactNode) => ReactNode>> = {
  bold: (children) => <strong className="font-bold text-white">{children}</strong>,
  italic: (children) => <em>{children}</em>,
  underline: (children) => <u className="underline-offset-4">{children}</u>,
  strike: (children) => <s className="opacity-70">{children}</s>,
  highlight: (children) => (
    <mark className="rounded-sm bg-accent/25 px-0.5 text-inherit">{children}</mark>
  ),
};

export function RichTextView({ runs }: { readonly runs: RichText }) {
  return runs.map((run, index) => {
    const formatted = (run.marks ?? []).reduceRight<ReactNode>(
      (children, mark) => MARK_WRAPPERS[mark](children),
      run.text,
    );
    if (run.href && isSafeHref(run.href)) {
      return (
        <a
          key={index}
          href={run.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
        >
          {formatted}
        </a>
      );
    }
    return <Fragment key={index}>{formatted}</Fragment>;
  });
}
