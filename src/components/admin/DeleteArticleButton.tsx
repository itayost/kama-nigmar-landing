"use client";

import { deleteArticle } from "@/lib/actions/articles";
import { ConfirmDelete } from "./ConfirmDelete";

interface DeleteArticleButtonProps {
  readonly articleId: string;
}

export function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  return (
    <ConfirmDelete
      question="למחוק? אי אפשר לבטל"
      onConfirm={() => {
        const formData = new FormData();
        formData.set("id", articleId);
        return deleteArticle(formData);
      }}
    />
  );
}
