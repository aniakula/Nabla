"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { normalizeLatex } from "@/lib/notes/math";

export type NoteSetCardData = {
  id: string;
  title: string;
  topicSlug: string | null;
  subtopicSlug: string | null;
  levelBand: string | null;
  previewText: string | null;
  createdAt: string;
  sourceFilenames: string[];
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

type Props = {
  note: NoteSetCardData;
  onClick: () => void;
  /** When provided (public library), shown instead of source filenames. */
  authorName?: string;
};

export function NoteSetCard({ note, onClick, authorName }: Props) {
  const topic = note.topicSlug ?? "other";
  const colorClass = TOPIC_COLORS[topic] ?? "bg-sand";
  const emoji = TOPIC_EMOJIS[topic] ?? "📝";

  const date = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-cartoon transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-cartoon-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral text-left w-full"
    >
      {/* Document preview area */}
      <div className={`relative h-36 ${colorClass} border-b-2 border-ink/15 p-3 overflow-hidden`}>
        <span className="text-2xl" aria-hidden>{emoji}</span>
        {note.previewText ? (
          <div className="mt-1.5 overflow-hidden text-[8.5px] leading-snug text-ink/60 line-clamp-5
            [&_.katex]:text-[8px] [&_.katex-display]:my-0 [&_p]:my-0 [&_ul]:my-0 [&_li]:my-0
            [&_h1]:text-[9px] [&_h2]:text-[9px] [&_h3]:text-[9px]
            [&_strong]:font-semibold">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {normalizeLatex(note.previewText)}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="mt-2 space-y-1.5" aria-hidden>
            {[80, 65, 70, 50].map((w, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full bg-ink/20"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="line-clamp-2 font-display text-sm font-bold leading-snug text-ink group-hover:text-coral">
          {note.title}
        </p>
        <p className="font-mono text-[10px] text-ink-muted">{date}</p>
        {authorName ? (
          <p className="truncate font-mono text-[10px] text-ink-muted/70">
            by {authorName}
          </p>
        ) : (
          note.sourceFilenames.length > 0 && (
            <p className="truncate font-mono text-[10px] text-ink-muted/70">
              {note.sourceFilenames[0]}
              {note.sourceFilenames.length > 1 &&
                ` +${note.sourceFilenames.length - 1}`}
            </p>
          )
        )}
      </div>
    </button>
  );
}
