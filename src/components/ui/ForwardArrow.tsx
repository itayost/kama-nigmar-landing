// The arrow of a "read" control. It points left, the way a Hebrew page moves
// forward, and nudges forward while its `group` link is hovered.
export function ForwardArrow({ className = "" }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform duration-300 ease-out group-hover:-translate-x-1 motion-reduce:transform-none ${className}`}
    >
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}
