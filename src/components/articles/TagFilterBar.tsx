import Link from "next/link";

interface TagFilterBarProps {
  readonly tags: readonly string[];
  readonly activeTag?: string;
}

const baseChipClass = "rounded-full border px-3.5 py-1.5 text-sm transition-colors";
const activeChipClass = `${baseChipClass} border-accent bg-accent font-medium text-bg-start`;
const idleChipClass = `${baseChipClass} border-surface-border text-text-muted hover:border-accent/50 hover:text-white`;

export function TagFilterBar({ tags, activeTag }: TagFilterBarProps) {
  if (tags.length === 0) return null;

  return (
    <nav aria-label="סינון לפי תגית" className="flex flex-wrap gap-2">
      <Link href="/articles" className={activeTag ? idleChipClass : activeChipClass}>
        הכל
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/articles?tag=${encodeURIComponent(tag)}`}
          className={tag === activeTag ? activeChipClass : idleChipClass}
        >
          {tag}
        </Link>
      ))}
    </nav>
  );
}
