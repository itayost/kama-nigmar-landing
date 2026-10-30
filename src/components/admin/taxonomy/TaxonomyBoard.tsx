"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  createTag,
  deleteTag,
  mergeTag,
  moveSubject,
  moveTag,
  renameTag,
  setSubjectOnHomepage,
  type ActionResult,
} from "@/lib/actions/taxonomy";
import type { AdminSubject, AdminTag, AdminTaxonomy } from "@/lib/dal/taxonomy-admin";
import { PlusIcon } from "../icons";
import { SelectedTagPanel } from "./SelectedTagPanel";
import { SubjectForm } from "./SubjectForm";
import { TagColumn, type ColumnActions } from "./TagColumn";

type TagChange =
  | { readonly kind: "move"; readonly id: string; readonly subjectId: string | null }
  | { readonly kind: "rename"; readonly id: string; readonly name: string }
  | { readonly kind: "remove"; readonly id: string };

function applyChange(tags: readonly AdminTag[], change: TagChange): AdminTag[] {
  if (change.kind === "remove") return tags.filter((tag) => tag.id !== change.id);
  return tags.map((tag) => {
    if (tag.id !== change.id) return tag;
    return change.kind === "move" ? { ...tag, subjectId: change.subjectId } : { ...tag, name: change.name };
  });
}

export function TaxonomyBoard({ subjects, tags }: AdminTaxonomy) {
  const [optimisticTags, changeTags] = useOptimistic(tags, applyChange);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminSubject | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(change: TagChange | null, action: () => Promise<ActionResult>): Promise<ActionResult> {
    setError(null);
    return new Promise((resolve) =>
      startTransition(async () => {
        if (change) changeTags(change);
        const result = await action();
        if (result.error) setError(result.error);
        resolve(result);
      }),
    );
  }

  function moveTo(tagId: string | null, subjectId: string | null) {
    if (!tagId) return;
    setSelectedId(null);
    setDraggingId(null);
    run({ kind: "move", id: tagId, subjectId }, () => moveTag(tagId, subjectId));
  }

  const actions: ColumnActions = {
    selectedId,
    draggingId,
    onSelect: (tagId) => setSelectedId((current) => (current === tagId ? null : tagId)),
    onDragStart: setDraggingId,
    onDragEnd: () => setDraggingId(null),
    onMoveHere: (subjectId) => moveTo(draggingId ?? selectedId, subjectId),
    async onCreate(name, subjectId) {
      return !(await run(null, () => createTag(name, subjectId))).error;
    },
  };

  const selected = optimisticTags.find((tag) => tag.id === selectedId) ?? null;
  const bySubject = useMemo(() => {
    const groups = new Map<string | null, AdminTag[]>();
    for (const tag of optimisticTags) groups.set(tag.subjectId, [...(groups.get(tag.subjectId) ?? []), tag]);
    return groups;
  }, [optimisticTags]);
  const tagsOf = (subjectId: string | null) => bySubject.get(subjectId) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-text-muted">
          כל תגית שייכת לנושא אחד. כתבה מופיעה בכל נושא שהתגיות שלה שייכות אליו.
        </p>
        {editing === null ? (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="ms-auto flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-sm transition-colors hover:border-accent/50"
          >
            <PlusIcon />
            נושא חדש
          </button>
        ) : null}
      </div>

      {editing !== null ? (
        <SubjectForm
          key={editing === "new" ? "new" : editing.id}
          subject={editing === "new" ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      ) : null}

      {error ? (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))] gap-3">
        <TagColumn subject={null} tags={tagsOf(null)} actions={actions} />
        {subjects.map((subject, index) => (
          <TagColumn
            key={subject.id}
            subject={subject}
            tags={tagsOf(subject.id)}
            isFirst={index === 0}
            isLast={index === subjects.length - 1}
            actions={actions}
            onEdit={() => setEditing(subject)}
            onReorder={(direction) => run(null, () => moveSubject(subject.id, direction))}
            onToggleHomepage={() => run(null, () => setSubjectOnHomepage(subject.id, !subject.onHomepage))}
          />
        ))}
      </div>

      {selected ? (
        <SelectedTagPanel
          key={selected.id}
          tag={selected}
          others={optimisticTags.filter((tag) => tag.id !== selected.id)}
          busy={isPending}
          onClose={() => setSelectedId(null)}
          onRename={(name) => run({ kind: "rename", id: selected.id, name }, () => renameTag(selected.id, name))}
          onMerge={(targetId) => {
            setSelectedId(null);
            run({ kind: "remove", id: selected.id }, () => mergeTag(selected.id, targetId));
          }}
          onDelete={() => {
            setSelectedId(null);
            run({ kind: "remove", id: selected.id }, () => deleteTag(selected.id));
          }}
        />
      ) : null}
    </div>
  );
}
