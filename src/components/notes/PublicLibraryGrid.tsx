"use client";

import { useState } from "react";
import { NoteSetCard, type NoteSetCardData } from "@/components/notes/NoteSetCard";
import { NoteViewerModal } from "@/components/notes/NoteViewerModal";

export type PublicNoteItem = NoteSetCardData & { authorName: string };

type Props = {
  notes: PublicNoteItem[];
};

export function PublicLibraryGrid({ notes }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (notes.length === 0) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center rounded-3xl border-2 border-dashed border-ink/20 bg-offwhite/50">
        <div className="text-center">
          <p className="font-display text-5xl font-bold text-ink/20">📚</p>
          <p className="mt-3 font-display text-xl font-bold text-ink/40">
            Nothing here yet
          </p>
          <p className="mt-1 font-mono text-sm text-ink-muted">
            Notes made public will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {notes.map((note) => (
          <NoteSetCard
            key={note.id}
            note={note}
            onClick={() => setOpenId(note.id)}
            authorName={note.authorName}
          />
        ))}
      </div>

      <NoteViewerModal
        noteSetId={openId}
        onClose={() => setOpenId(null)}
        variant="public"
      />
    </>
  );
}
