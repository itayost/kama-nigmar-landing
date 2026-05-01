interface PlatformButtonProps {
  readonly href: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly variant: "spotify" | "apple";
}

const variantStyles = {
  spotify:
    "bg-spotify hover:shadow-[0_0_20px_rgba(29,185,84,0.4)] focus-visible:shadow-[0_0_20px_rgba(29,185,84,0.4)]",
  apple:
    "bg-apple hover:shadow-[0_0_20px_rgba(135,46,196,0.4)] focus-visible:shadow-[0_0_20px_rgba(135,46,196,0.4)]",
} as const;

export function PlatformButton({ href, label, ariaLabel, variant }: PlatformButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={`
        inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white
        transition-all duration-200 ease-out
        hover:scale-105 focus-visible:scale-105
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        motion-reduce:transition-none motion-reduce:hover:scale-100
        ${variantStyles[variant]}
      `}
    >
      {label}
    </a>
  );
}
