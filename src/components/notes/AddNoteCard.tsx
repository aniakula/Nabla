"use client";

import { UploadModal } from "@/components/notes/UploadModal";
import { useState } from "react";

type Props = {
  /** If provided, called instead of opening the internal modal. */
  onClick?: () => void;
};

export function AddNoteCard({ onClick }: Props = {}) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = onClick ?? (() => setModalOpen(true));

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="group flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-ink/40 bg-transparent transition-all hover:border-coral hover:bg-peach/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        style={{ minHeight: "13rem" }}
        aria-label="Add new notes"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink/30 bg-offwhite text-3xl shadow-cartoon-sm transition-all group-hover:border-coral group-hover:bg-peach/40 group-hover:shadow-cartoon">
          +
        </span>
        <span className="font-display text-base font-semibold text-ink-muted group-hover:text-coral">
          New notes
        </span>
      </button>

      {/* Only rendered when no external onClick is controlling the modal */}
      {!onClick && (
        <UploadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
