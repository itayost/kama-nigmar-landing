interface StatusBadgeProps {
  readonly status: "draft" | "published";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "published") {
    return (
      <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
        פורסם
      </span>
    );
  }
  return (
    <span className="rounded-full border border-surface-border bg-surface px-2.5 py-0.5 text-xs font-medium text-text-muted">
      טיוטה
    </span>
  );
}
