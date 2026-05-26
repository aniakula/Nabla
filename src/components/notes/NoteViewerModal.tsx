"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Question, MCQ, TrueFalse, FRQ, Flashcard } from "@/types/notes";
import { normalizeLatex } from "@/lib/notes/math";

/** Renders a short string that may contain inline markdown + LaTeX math. */
function MathText({ children }: { children: string }) {
  if (!children) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children: c }) => <span>{c}</span>,
      }}
    >
      {normalizeLatex(children)}
    </ReactMarkdown>
  );
}

/** Small badge-button showing public/private state. */
function VisibilityBadge({
  isPublic,
  onClick,
  size = "md",
}: {
  isPublic: boolean;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={isPublic ? "Click to make private" : "Click to make public"}
      className={`inline-flex items-center gap-1 rounded-lg font-mono font-semibold transition-all
        ${
          size === "sm"
            ? "border px-1.5 py-0.5 text-[9px]"
            : "border-2 px-3 py-1.5 text-xs"
        }
        ${
          isPublic
            ? "border-mint bg-mint/20 text-ink hover:bg-mint/40"
            : "border-ink/25 bg-cream text-ink-muted hover:border-ink hover:text-ink"
        }`}
    >
      {isPublic ? "🌐 Public" : "🔒 Private"}
    </button>
  );
}

type NoteSetDetail = {
  id: string;
  title: string;
  topic_slug: string | null;
  level_band: string | null;
  source_filenames: string[];
  created_at: string;
  is_public: boolean;
  /** Populated only in public variant — the author's display name. */
  authorName?: string;
};

type NoteQuestion = {
  id: string;
  type: string;
  question_data: Question;
  is_public: boolean;
};

type NoteViewerData = {
  noteSet: NoteSetDetail;
  questions: NoteQuestion[];
  markdownContent: string | null;
};

type ConfirmState =
  | { kind: "noteSet"; targetPublic: boolean }
  | { kind: "question"; questionId: string; targetPublic: boolean };

type Props = {
  noteSetId: string | null;
  onClose: () => void;
  /**
   * "owned" (default) — shows visibility controls, download, fetches from
   * /api/notes/[id].
   * "public" — read-only view from /api/notes/public/[id]; no edit controls.
   */
  variant?: "owned" | "public";
};

export function NoteViewerModal({ noteSetId, onClose, variant = "owned" }: Props) {
  const isPublic = variant === "public";
  const [data, setData] = useState<NoteViewerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "questions">("notes");
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [visibilityPending, setVisibilityPending] = useState(false);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteSetId) return;
    setData(null);
    setError(null);
    setLoading(true);
    setActiveTab("notes");
    setFlipped(new Set());
    setConfirm(null);
    setVisibilityError(null);

    const url =
      variant === "public"
        ? `/api/notes/public/${noteSetId}`
        : `/api/notes/${noteSetId}`;

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json as NoteViewerData);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [noteSetId, variant]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (confirm) setConfirm(null);
        else onClose();
      }
    }
    if (noteSetId) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [noteSetId, onClose, confirm]);

  async function applyNoteSetVisibility(targetPublic: boolean) {
    if (!noteSetId) return;
    setVisibilityPending(true);
    setVisibilityError(null);
    try {
      const res = await fetch(`/api/notes/${noteSetId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: targetPublic }),
      });
      if (!res.ok) throw new Error("Failed to update visibility");
      setData((prev) =>
        prev
          ? {
              ...prev,
              noteSet: { ...prev.noteSet, is_public: targetPublic },
              questions: prev.questions.map((q) => ({
                ...q,
                is_public: targetPublic,
              })),
            }
          : prev
      );
    } catch {
      setVisibilityError("Could not update visibility. Try again.");
    } finally {
      setVisibilityPending(false);
      setConfirm(null);
    }
  }

  async function applyQuestionVisibility(
    questionId: string,
    targetPublic: boolean
  ) {
    setVisibilityPending(true);
    setVisibilityError(null);
    try {
      const res = await fetch(
        `/api/notes/questions/${questionId}/visibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_public: targetPublic }),
        }
      );
      if (!res.ok) throw new Error("Failed to update visibility");
      setData((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q) =>
                q.id === questionId ? { ...q, is_public: targetPublic } : q
              ),
            }
          : prev
      );
    } catch {
      setVisibilityError("Could not update visibility. Try again.");
    } finally {
      setVisibilityPending(false);
      setConfirm(null);
    }
  }

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.kind === "noteSet") {
      applyNoteSetVisibility(confirm.targetPublic);
    } else {
      applyQuestionVisibility(confirm.questionId, confirm.targetPublic);
    }
  }

  function getConfirmMessage(c: ConfirmState) {
    if (c.kind === "noteSet") {
      return c.targetPublic
        ? "This will make the entire note set and all its questions visible to others. You can make it private again at any time."
        : "This will make the entire note set and all its questions private.";
    }
    return c.targetPublic
      ? "This will make this question visible to others."
      : "This will make this question private.";
  }

  if (!noteSetId) return null;

  const questionCount = data?.questions.length ?? 0;
  const mcqs = data?.questions.filter((q) => q.type === "mcq") ?? [];
  const tfs = data?.questions.filter((q) => q.type === "true_false") ?? [];
  const frqs = data?.questions.filter((q) => q.type === "frq") ?? [];
  const flashcards =
    data?.questions.filter((q) => q.type === "flashcard") ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal
      aria-label={data?.noteSet.title ?? "Note viewer"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-ink bg-offwhite shadow-cartoon-lg"
        style={{ maxHeight: "90vh" }}
      >
        {/* Confirmation overlay */}
        {confirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-ink/40 p-6 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border-2 border-ink bg-offwhite p-6 shadow-cartoon">
              <h3 className="font-display text-lg font-bold text-ink">
                {confirm.targetPublic ? "Make public?" : "Make private?"}
              </h3>
              <p className="mt-2 font-mono text-sm leading-relaxed text-ink-muted">
                {getConfirmMessage(confirm)}
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirm(null)}
                  disabled={visibilityPending}
                  className="flex-1 rounded-xl border-2 border-ink/30 bg-cream px-4 py-2 font-mono text-sm font-semibold text-ink transition-all hover:border-ink disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={visibilityPending}
                  className={`flex-1 rounded-xl border-2 px-4 py-2 font-mono text-sm font-semibold transition-all disabled:opacity-50
                    ${
                      confirm.targetPublic
                        ? "border-mint bg-mint/30 text-ink hover:bg-mint/50"
                        : "border-coral bg-peach/30 text-ink hover:bg-peach/50"
                    }`}
                >
                  {visibilityPending
                    ? "Saving…"
                    : confirm.targetPublic
                    ? "Yes, make public"
                    : "Yes, make private"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b-2 border-ink/10 px-6 py-4">
          <div className="min-w-0">
            {loading && (
              <div className="h-6 w-48 animate-pulse rounded-lg bg-ink/10" />
            )}
            {data && (
              <>
                <h2 className="font-display text-xl font-bold text-ink line-clamp-1">
                  {data.noteSet.title}
                </h2>
                <p className="mt-0.5 font-mono text-xs text-ink-muted">
                  {new Date(data.noteSet.created_at).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                  {isPublic && data.noteSet.authorName
                    ? ` · by ${data.noteSet.authorName}`
                    : data.noteSet.source_filenames?.length > 0
                    ? ` · ${data.noteSet.source_filenames[0]}${data.noteSet.source_filenames.length > 1 ? ` +${data.noteSet.source_filenames.length - 1}` : ""}`
                    : null}
                </p>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {data?.noteSet && !isPublic && (
              <>
                <VisibilityBadge
                  isPublic={data.noteSet.is_public}
                  onClick={() =>
                    setConfirm({
                      kind: "noteSet",
                      targetPublic: !data.noteSet.is_public,
                    })
                  }
                />
                <a
                  href={`/api/notes/${noteSetId}/download`}
                  download
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink/30 bg-cream px-3 py-1.5 font-mono text-xs font-semibold text-ink transition-all hover:border-ink hover:shadow-cartoon-sm"
                >
                  ↓ Download
                </a>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink/20 font-mono text-lg font-bold text-ink-muted transition-colors hover:border-ink hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        {data && (
          <div className="flex shrink-0 gap-1 border-b-2 border-ink/10 px-6 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`rounded-t-xl border-2 border-b-0 px-4 py-2 font-mono text-xs font-semibold transition-colors ${
                activeTab === "notes"
                  ? "border-ink bg-offwhite text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("questions")}
              className={`rounded-t-xl border-2 border-b-0 px-4 py-2 font-mono text-xs font-semibold transition-colors ${
                activeTab === "questions"
                  ? "border-ink bg-offwhite text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              Questions
              {questionCount > 0 && (
                <span className="ml-1.5 rounded-full bg-coral px-1.5 py-0.5 text-[9px] font-bold text-offwhite">
                  {questionCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col gap-3 p-8">
              {[100, 80, 90, 60, 85, 70].map((w, i) => (
                <div
                  key={i}
                  className="h-3 animate-pulse rounded-full bg-ink/10"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <p className="font-mono text-sm text-coral">{error}</p>
            </div>
          )}

          {visibilityError && !confirm && (
            <div className="mx-6 mt-4 rounded-xl border-2 border-coral bg-peach/30 px-4 py-2 font-mono text-xs text-ink">
              {visibilityError}
            </div>
          )}

          {/* Notes tab */}
          {data && activeTab === "notes" && (
            <div className="px-6 py-6">
              {data.markdownContent ? (
                <div
                  className="prose prose-sm max-w-none
                  prose-headings:font-display prose-headings:font-bold prose-headings:text-ink
                  prose-h1:text-2xl prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
                  prose-p:text-ink prose-p:leading-relaxed
                  prose-strong:text-ink prose-strong:font-semibold
                  prose-li:text-ink prose-li:leading-relaxed
                  prose-ul:my-2 prose-ol:my-2
                  prose-code:rounded prose-code:bg-sand prose-code:px-1 prose-code:text-xs
                  prose-blockquote:border-coral prose-blockquote:text-ink-muted"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {normalizeLatex(data.markdownContent)}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="font-mono text-sm text-ink-muted">
                  Markdown file not available.
                </p>
              )}
            </div>
          )}

          {/* Questions tab */}
          {data && activeTab === "questions" && (
            <div className="flex flex-col gap-6 px-6 py-6">
              {questionCount === 0 && (
                <p className="font-mono text-sm text-ink-muted">
                  {isPublic
                    ? "No public questions in this note set."
                    : "No questions were generated for this note set."}
                </p>
              )}

              {/* MCQ */}
              {mcqs.length > 0 && (
                <section>
                  <h3 className="mb-3 font-display text-base font-bold text-ink">
                    Multiple Choice
                    <span className="ml-2 font-mono text-xs font-normal text-ink-muted">
                      {mcqs.length}
                    </span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {mcqs.map((q) => {
                      const d = q.question_data as MCQ;
                      return (
                        <div
                          key={q.id}
                          className="relative rounded-2xl border-2 border-ink/15 bg-card p-4"
                        >
                          {!isPublic && (
                            <div className="absolute right-3 top-3">
                              <VisibilityBadge
                                isPublic={q.is_public}
                                size="sm"
                                onClick={() =>
                                  setConfirm({
                                    kind: "question",
                                    questionId: q.id,
                                    targetPublic: !q.is_public,
                                  })
                                }
                              />
                            </div>
                          )}
                          <p className="mb-3 pr-20 font-display text-sm font-semibold text-ink">
                            <MathText>{d.question}</MathText>
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {d.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`flex items-start gap-2.5 rounded-xl border-2 px-3 py-2 font-mono text-xs ${
                                  opt.id === d.correctOptionId
                                    ? "border-mint bg-mint/30 font-semibold text-ink"
                                    : "border-ink/10 bg-cream text-ink-muted"
                                }`}
                              >
                                <span className="shrink-0 font-bold uppercase">
                                  {opt.id}
                                </span>
                                <span>
                                  <MathText>{opt.text}</MathText>
                                </span>
                              </div>
                            ))}
                          </div>
                          {d.explanation && (
                            <p className="mt-3 border-t border-ink/10 pt-2 font-mono text-[11px] text-ink-muted">
                              💡 <MathText>{d.explanation}</MathText>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* True / False */}
              {tfs.length > 0 && (
                <section>
                  <h3 className="mb-3 font-display text-base font-bold text-ink">
                    True / False
                    <span className="ml-2 font-mono text-xs font-normal text-ink-muted">
                      {tfs.length}
                    </span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {tfs.map((q) => {
                      const d = q.question_data as TrueFalse;
                      return (
                        <div
                          key={q.id}
                          className="relative rounded-2xl border-2 border-ink/15 bg-card p-4"
                        >
                          {!isPublic && (
                            <div className="absolute right-3 top-3">
                              <VisibilityBadge
                                isPublic={q.is_public}
                                size="sm"
                                onClick={() =>
                                  setConfirm({
                                    kind: "question",
                                    questionId: q.id,
                                    targetPublic: !q.is_public,
                                  })
                                }
                              />
                            </div>
                          )}
                          <p className="mb-2 pr-20 font-display text-sm font-semibold text-ink">
                            <MathText>{d.statement}</MathText>
                          </p>
                          <span
                            className={`inline-block rounded-lg border-2 px-3 py-1 font-mono text-xs font-bold ${
                              d.answer
                                ? "border-mint bg-mint/30 text-ink"
                                : "border-coral bg-peach/30 text-ink"
                            }`}
                          >
                            {d.answer ? "✓ True" : "✗ False"}
                          </span>
                          {d.explanation && (
                            <p className="mt-2 border-t border-ink/10 pt-2 font-mono text-[11px] text-ink-muted">
                              💡 <MathText>{d.explanation}</MathText>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* FRQ */}
              {frqs.length > 0 && (
                <section>
                  <h3 className="mb-3 font-display text-base font-bold text-ink">
                    Free Response
                    <span className="ml-2 font-mono text-xs font-normal text-ink-muted">
                      {frqs.length}
                    </span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {frqs.map((q) => {
                      const d = q.question_data as FRQ;
                      return (
                        <div
                          key={q.id}
                          className="relative rounded-2xl border-2 border-ink/15 bg-card p-4"
                        >
                          {!isPublic && (
                            <div className="absolute right-3 top-3">
                              <VisibilityBadge
                                isPublic={q.is_public}
                                size="sm"
                                onClick={() =>
                                  setConfirm({
                                    kind: "question",
                                    questionId: q.id,
                                    targetPublic: !q.is_public,
                                  })
                                }
                              />
                            </div>
                          )}
                          <p className="mb-2 pr-20 font-display text-sm font-semibold text-ink">
                            <MathText>{d.question}</MathText>
                          </p>
                          {d.sampleAnswer && (
                            <div className="rounded-xl border-l-4 border-coral/50 bg-peach/20 px-3 py-2">
                              <p className="mb-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-coral">
                                Sample answer
                              </p>
                              <p className="font-mono text-xs text-ink">
                                <MathText>{d.sampleAnswer}</MathText>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Flashcards */}
              {flashcards.length > 0 && (
                <section>
                  <h3 className="mb-3 font-display text-base font-bold text-ink">
                    Flashcards
                    <span className="ml-2 font-mono text-xs font-normal text-ink-muted">
                      {flashcards.length}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {flashcards.map((q) => {
                      const d = q.question_data as Flashcard;
                      const isFlipped = flipped.has(q.id);
                      return (
                        <div key={q.id} className="relative">
                          {!isPublic && (
                            <div className="absolute right-2 top-2 z-10">
                              <VisibilityBadge
                                isPublic={q.is_public}
                                size="sm"
                                onClick={() =>
                                  setConfirm({
                                    kind: "question",
                                    questionId: q.id,
                                    targetPublic: !q.is_public,
                                  })
                                }
                              />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setFlipped((prev) => {
                                const next = new Set(prev);
                                if (next.has(q.id)) next.delete(q.id);
                                else next.add(q.id);
                                return next;
                              })
                            }
                            className="group relative min-h-[7rem] w-full rounded-2xl border-2 border-ink/15 bg-card p-4 pt-8 text-left transition-all hover:border-ink hover:shadow-cartoon-sm"
                          >
                            <span className="absolute left-3 top-2.5 font-mono text-[9px] uppercase tracking-wider text-ink-muted/60">
                              {isFlipped ? "back" : "front"} · tap to flip
                            </span>
                            <p
                              className={`font-mono text-sm ${
                                isFlipped
                                  ? "font-normal text-ink-muted"
                                  : "font-semibold text-ink"
                              }`}
                            >
                              <MathText>
                                {isFlipped ? d.back : d.front}
                              </MathText>
                            </p>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
