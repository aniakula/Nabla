"use client";

import { UploadModal } from "@/components/notes/UploadModal";
import { NoteViewerModal } from "@/components/notes/NoteViewerModal";
import type { NoteSetCardData } from "@/components/notes/NoteSetCard";
import type { Topic } from "@/types/curriculum";
import { useId, useState } from "react";

const TOPIC_ACCENT: Record<string, string> = {
  math: "bg-mint",
  science: "bg-sky",
  english: "bg-lavender",
  history: "bg-lemon",
  "computer-science": "bg-peach",
  languages: "bg-sand",
  arts: "bg-lavender",
  other: "bg-sand",
};

const TOPIC_COLORS: Record<string, string> = {
  math: "bg-mint",
  science: "bg-sky",
  english: "bg-lavender",
  history: "bg-lemon",
  "computer-science": "bg-peach",
  languages: "bg-sand",
  arts: "bg-lavender",
  other: "bg-sand",
};

const TOPIC_EMOJIS: Record<string, string> = {
  math: "🔢",
  science: "🔬",
  english: "📖",
  history: "🌍",
  "computer-science": "💻",
  languages: "🗣️",
  arts: "🎨",
  other: "📝",
};

type NoteTopicSectionProps = {
  topic: Topic | { id: "other"; slug: "other"; name: "Other"; emoji: "📁" };
  notes: NoteSetCardData[];
  defaultOpen?: boolean;
};

export function NotesTopicAccordion({
  topic,
  notes,
  defaultOpen = false,
}: NoteTopicSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const panelId = useId();
  const headerId = useId();
  const accent = TOPIC_ACCENT[topic.slug] ?? "bg-sand";

  return (
    <>
      <article className="rounded-3xl border-2 border-ink bg-card shadow-cartoon">
        <button
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-sand/30"
        >
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-ink text-2xl shadow-cartoon-sm ${accent}`}
            aria-hidden
          >
            {topic.emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl font-bold text-ink">
              {topic.name}
            </span>
            <span className="mt-0.5 block font-mono text-xs text-ink-muted">
              {notes.length === 0
                ? "No notes yet"
                : `${notes.length} note set${notes.length !== 1 ? "s" : ""}`}
            </span>
          </span>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-offwhite font-mono text-lg font-bold transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {open && (
          <div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            className="border-t-2 border-ink/10 px-5 pb-5 pt-4"
          >
            {notes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="font-mono text-sm text-ink-muted">
                  No notes here yet.
                </p>
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink/30 bg-cream px-4 py-2 font-display text-sm font-semibold text-ink-muted shadow-cartoon-sm transition-all hover:border-coral hover:text-coral hover:shadow-cartoon"
                >
                  + Add notes
                </button>
              </div>
            ) : (
              <>
                {/* Mini card grid for this topic */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {notes.map((note) => {
                    const colorClass = TOPIC_COLORS[topic.slug] ?? "bg-sand";
                    const emoji = TOPIC_EMOJIS[topic.slug] ?? "📝";
                    return (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => setViewingId(note.id)}
                        className="group flex flex-col overflow-hidden rounded-2xl border-2 border-ink/20 bg-offwhite shadow-cartoon-sm transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-cartoon text-left"
                      >
                        <div className={`h-24 ${colorClass} border-b-2 border-ink/10 p-2.5 overflow-hidden`}>
                          <span className="text-xl" aria-hidden>{emoji}</span>
                          {note.previewText ? (
                            <p className="mt-1 font-mono text-[8px] leading-relaxed text-ink/60 line-clamp-4 whitespace-pre-line">
                              {note.previewText}
                            </p>
                          ) : (
                            <div className="mt-1.5 space-y-1" aria-hidden>
                              {[75, 60, 70].map((w, i) => (
                                <div key={i} className="h-1 rounded-full bg-ink/20" style={{ width: `${w}%` }} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="line-clamp-1 font-display text-xs font-bold text-ink group-hover:text-coral">
                            {note.title}
                          </p>
                          <p className="font-mono text-[9px] text-ink-muted">
                            {new Date(note.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  className="mt-3 flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-ink/25 px-4 py-3 font-mono text-sm text-ink-muted transition-colors hover:border-coral hover:text-coral"
                >
                  + Add more notes to {topic.name}
                </button>
              </>
            )}
          </div>
        )}
      </article>

      <NoteViewerModal
        noteSetId={viewingId}
        onClose={() => setViewingId(null)}
      />

      <UploadModal
        isOpen={uploadOpen}
        initialTopic={{ slug: topic.slug, name: topic.name, emoji: topic.emoji }}
        onClose={() => setUploadOpen(false)}
      />
    </>
  );
}
