"use client";

import { useState } from "react";
import { deleteArticle } from "@/lib/actions/articles";

interface DeleteArticleButtonProps {
  readonly articleId: string;
}

export function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="rounded-md border border-surface-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-red-400/50 hover:text-red-400"
      >
        מחיקה
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-red-400">למחוק? אי אפשר לבטל</span>
      <form action={deleteArticle}>
        <input type="hidden" name="id" value={articleId} />
        <button
          type="submit"
          className="rounded-md bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
        >
          מחיקה
        </button>
      </form>
      <button
        type="button"
        onClick={() => setIsConfirming(false)}
        className="rounded-md border border-surface-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-white"
      >
        ביטול
      </button>
    </div>
  );
}
