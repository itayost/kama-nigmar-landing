import Link from "next/link";

interface SectionHeadingProps {
  readonly title: string;
  readonly id?: string;
  readonly linkHref?: string;
  readonly linkLabel?: string;
  readonly as?: "h1" | "h2";
  // A subject's color for its section mark; the brand green otherwise.
  readonly color?: string;
}

export function SectionHeading({
  title,
  id,
  linkHref,
  linkLabel,
  as: Tag = "h2",
  color,
}: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <Tag
        id={id}
        className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight"
      >
        <span
          aria-hidden="true"
          style={color ? { backgroundColor: color } : undefined}
          className={`h-2.5 w-2.5 rounded-[3px] ${color ? "" : "bg-accent shadow-[0_0_14px_rgba(46,204,64,0.6)]"}`}
        />
        {title}
      </Tag>
      {linkHref && linkLabel ? (
        <Link
          href={linkHref}
          style={color ? { color } : undefined}
          className="text-sm font-semibold text-accent transition-opacity hover:opacity-80"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
