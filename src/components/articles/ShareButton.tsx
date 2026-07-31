"use client";

import { useState } from "react";

interface ShareButtonProps {
  readonly title: string;
  readonly url: string;
  readonly slug: string;
}

export function ShareButton({ title, url, slug }: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        // User dismissed the share sheet; nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard unavailable; nothing to do.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      data-ph-event="share_click"
      data-ph-slug={slug}
      className="flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1 text-xs text-text-muted transition-colors hover:border-accent/50 hover:text-white"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81a2.99 2.99 0 1 0 0 4.38l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92Z" />
      </svg>
      {isCopied ? "הקישור הועתק" : "שיתוף"}
    </button>
  );
}
