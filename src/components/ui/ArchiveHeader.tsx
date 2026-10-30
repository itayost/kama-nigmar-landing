import type { ReactNode } from "react";

interface ArchiveHeaderProps {
  readonly title: string;
  readonly description: string;
  // The rule under the header: the subject's color, white for roundups.
  readonly color: string;
  readonly children?: ReactNode;
}

// The masthead of a listing page: a subject or the roundups.
export function ArchiveHeader({ title, description, color, children }: ArchiveHeaderProps) {
  return (
    <header style={{ borderColor: color }} className="mb-6 border-b-[3px] pt-8 pb-5 md:pt-10">
      <h1 className="text-[clamp(2.4rem,1.6rem+3.6vw,4rem)] leading-[0.95] font-black tracking-tight">{title}</h1>
      <p className="mt-3 text-[0.95rem] text-white/75">{description}</p>
      {children}
    </header>
  );
}
