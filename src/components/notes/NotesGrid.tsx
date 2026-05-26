"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NoteSetCard, type NoteSetCardData } from "@/components/notes/NoteSetCard";
import { AddNoteCard } from "@/components/notes/AddNoteCard";
import { NoteViewerModal } from "@/components/notes/NoteViewerModal";
import { UploadModal } from "@/components/notes/UploadModal";

type Props = {
  notes: NoteSetCardData[];
  showAdd?: boolean;
};

export function NotesGrid({ notes, showAdd = true }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewingId, setViewingId] = useState<string | null>(
    searchParams.get("open")
  );
  const [uploadOpen, setUploadOpen] = useState(false);

  // When the modal is closed, clean up the ?open= param from the URL
  function handleClose() {
    setViewingId(null);
    if (searchParams.get("open")) {
      router.replace("/notes/all_notes", { scroll: false });
    }
  }

  // If ?open= changes (e.g. after redirect from /notes/[id]), sync state
  useEffect(() => {
    const id = searchParams.get("open");
    if (id) setViewingId(id);
  }, [searchParams]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {showAdd && <AddNoteCard onClick={() => setUploadOpen(true)} />}
        {notes.map((note) => (
          <NoteSetCard
            key={note.id}
            note={note}
            onClick={() => setViewingId(note.id)}
          />
        ))}
      </div>

      <NoteViewerModal noteSetId={viewingId} onClose={handleClose} />

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
