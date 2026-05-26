"use client";

import { LevelBandRangePicker, levelBandRangeToString } from "@/components/notes/LevelBandRangePicker";
import { CURRICULUM_TOPICS } from "@/lib/curriculum/taxonomy";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_BATCH_BYTES = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_TYPES = ["application/pdf", "text/plain"];
const ACCEPTED_EXT = [".pdf", ".txt"];

type QuestionType = "mcq" | "true_false" | "frq" | "flashcard";

const QUESTION_TYPE_LABELS: Record<QuestionType, { label: string; description: string }> = {
  mcq: { label: "Multiple choice", description: "4-option questions with one correct answer" },
  true_false: { label: "True / False", description: "Statement cards the student judges" },
  frq: { label: "Free response", description: "Open-ended questions with sample answers" },
  flashcard: { label: "Flashcards", description: "Front / back cards for quick review" },
};

const SOURCE_TABS = [
  { id: "document", label: "Document", active: true },
  { id: "text", label: "Text", active: false },
  { id: "article", label: "Article", active: false },
  { id: "youtube", label: "YouTube", active: false },
];

type InitialTopic = {
  slug: string;
  name: string;
  emoji: string;
};

type Props = {
  isOpen: boolean;
  initialTopic?: InitialTopic | null;
  onClose: () => void;
};

type QuestionConfig = {
  enabled: boolean;
  count: number;
};

const DEFAULT_QUESTION_CONFIG: Record<QuestionType, QuestionConfig> = {
  mcq: { enabled: true, count: 10 },
  true_false: { enabled: true, count: 5 },
  frq: { enabled: false, count: 5 },
  flashcard: { enabled: false, count: 10 },
};

export function UploadModal({ isOpen, initialTopic, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 state — all start empty; seeded by effect below when modal opens
  const [title, setTitle] = useState("");
  const [genreSlug, setGenreSlug] = useState<string>("");
  const [subtopicSlug, setSubtopicSlug] = useState<string>("");
  const [levelStart, setLevelStart] = useState(0);
  const [levelEnd, setLevelEnd] = useState(3);
  const [questionConfig, setQuestionConfig] = useState<Record<QuestionType, QuestionConfig>>(
    DEFAULT_QUESTION_CONFIG
  );

  // Seed pre-fill when opening; reset when closing
  useEffect(() => {
    if (isOpen) {
      setGenreSlug(initialTopic?.slug ?? "");
      setSubtopicSlug("");
    } else {
      const t = setTimeout(() => {
        setStep(1);
        setFiles([]);
        setFileError(null);
        setTitle("");
        setGenreSlug("");
        setSubtopicSlug("");
        setLevelStart(0);
        setLevelEnd(3);
        setQuestionConfig(DEFAULT_QUESTION_CONFIG);
        setSubmitting(false);
        setSubmitError(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, initialTopic?.slug]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  function validateAndAddFiles(incoming: File[]) {
    setFileError(null);
    const next = [...files];

    for (const file of incoming) {
      const isValidType =
        ACCEPTED_TYPES.includes(file.type) ||
        ACCEPTED_EXT.some((ext) => file.name.toLowerCase().endsWith(ext));

      if (!isValidType) {
        setFileError(`"${file.name}" is not a supported type. Use PDF or TXT.`);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setFileError(`"${file.name}" exceeds the 10 MB per-file limit.`);
        return;
      }
      if (!next.find((f) => f.name === file.name && f.size === file.size)) {
        next.push(file);
      }
    }

    const totalSize = next.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > MAX_BATCH_BYTES) {
      setFileError("Total batch size exceeds 25 MB. Remove some files.");
      return;
    }

    setFiles(next);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    validateAndAddFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      validateAndAddFiles(Array.from(e.target.files));
    }
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setFileError(null);
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const selectedGenre = CURRICULUM_TOPICS.find((t) => t.slug === genreSlug);
  const allSubsections = selectedGenre
    ? Object.entries(selectedGenre.levels).flatMap(([band, subs]) =>
        subs.map((s) => ({ ...s, band }))
      )
    : [];

  function handleLevelChange(start: number, end: number) {
    setLevelStart(start);
    setLevelEnd(end);
  }

  function toggleQuestionType(type: QuestionType) {
    setQuestionConfig((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled },
    }));
  }

  function setQuestionCount(type: QuestionType, value: number) {
    const clamped = Math.max(1, Math.min(20, value));
    setQuestionConfig((prev) => ({
      ...prev,
      [type]: { ...prev[type], count: clamped },
    }));
  }

  async function handleSubmit() {
    if (!step2Valid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData();
      for (const file of files) fd.append("files", file);
      fd.append("title", title.trim());
      fd.append("topic_slug", genreSlug || "other");
      fd.append("subtopic_slug", subtopicSlug || "other");
      fd.append("level_band", levelBandRangeToString(levelStart, levelEnd));

      for (const [type, cfg] of Object.entries(questionConfig) as [QuestionType, QuestionConfig][]) {
        const countKey =
          type === "mcq" ? "mcq_count" :
          type === "true_false" ? "tf_count" :
          type === "frq" ? "frq_count" :
          "flashcard_count";
        fd.append(countKey, cfg.enabled ? String(cfg.count) : "0");
      }

      const res = await fetch("/api/notes/upload", { method: "POST", body: fd });
      const json = await res.json() as { noteSetId?: string; error?: string };

      if (!res.ok || !json.noteSetId) {
        throw new Error(json.error ?? "Processing failed. Please try again.");
      }

      onClose();
      router.push(`/notes/all_notes?open=${json.noteSetId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  const step1Valid = files.length > 0;
  const step2Valid = title.trim().length > 0;
  const anyQuestionsEnabled = Object.values(questionConfig).some((q) => q.enabled);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal
      aria-label="Upload notes"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal panel */}
      <div className="relative z-10 flex w-full max-w-xl flex-col rounded-3xl border-2 border-ink bg-offwhite shadow-cartoon-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-ink/10 px-6 py-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Step {step} of 2
            </p>
            <h2 className="font-display text-xl font-bold text-ink">
              {step === 1 ? "Upload your documents" : "Configure your notes"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink/20 font-mono text-lg font-bold text-ink-muted transition-colors hover:border-ink hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Step 1 — Upload */}
        {step === 1 && (
          <div className="flex flex-col gap-5 p-6">
            {/* Source type tabs */}
            <div className="flex gap-1.5 overflow-x-auto">
              {SOURCE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  disabled={!tab.active}
                  className={`shrink-0 rounded-xl border-2 px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
                    tab.active
                      ? "border-ink bg-coral text-offwhite"
                      : "cursor-not-allowed border-ink/20 text-ink-muted/50"
                  }`}
                  title={tab.active ? undefined : "Coming soon"}
                >
                  {tab.label}
                  {!tab.active && (
                    <span className="ml-1 text-[9px] uppercase opacity-60">soon</span>
                  )}
                </button>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex min-h-[10rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                dragOver
                  ? "border-coral bg-peach/20"
                  : "border-ink/30 bg-cream hover:border-ink/50 hover:bg-sand/30"
              }`}
            >
              <div className="flex gap-3" aria-hidden>
                {["PDF", "TXT"].map((t) => (
                  <div
                    key={t}
                    className="flex h-12 w-10 flex-col items-center justify-end rounded-lg border-2 border-ink/25 bg-card pb-1.5 text-[9px] font-bold uppercase tracking-wider text-ink-muted shadow-cartoon-sm"
                  >
                    {t}
                  </div>
                ))}
              </div>
              <p className="font-mono text-sm text-ink-muted">
                Drag & drop or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-semibold text-coral underline underline-offset-2 hover:text-peach"
                >
                  browse
                </button>
              </p>
              <p className="font-mono text-xs text-ink-muted/60">
                PDF and TXT · 10 MB per file · 25 MB total
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                multiple
                className="sr-only"
                onChange={handleFileInput}
              />
            </div>

            {/* File error */}
            {fileError && (
              <p className="rounded-xl border-2 border-coral bg-peach/30 px-4 py-2 font-mono text-xs text-ink">
                {fileError}
              </p>
            )}

            {/* File list */}
            {files.length > 0 && (
              <ul className="flex flex-col gap-2">
                {files.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl border-2 border-ink/15 bg-card px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 font-mono text-xs font-bold uppercase text-ink-muted">
                        {file.name.endsWith(".pdf") ? "PDF" : "TXT"}
                      </span>
                      <span className="truncate font-mono text-xs text-ink">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 pl-3">
                      <span className="font-mono text-[10px] text-ink-muted">
                        {formatBytes(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="font-mono text-xs text-ink-muted hover:text-coral"
                        aria-label={`Remove ${file.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Next button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-coral px-6 py-3 font-display text-lg font-semibold text-offwhite shadow-cartoon transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-cartoon-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Configure */}
        {step === 2 && (
          <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto p-6">
            {/* Title */}
            <label className="block">
              <span className="font-mono text-sm font-semibold text-ink">
                Note set name <span className="text-coral">*</span>
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calculus II — Integration Techniques"
                className="mt-1.5 w-full rounded-xl border-2 border-ink bg-cream px-4 py-2.5 font-mono text-sm outline-none ring-coral focus:ring-2"
              />
            </label>

            {/* Genre */}
            <label className="block">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-ink">Subject</span>
                {initialTopic && genreSlug === initialTopic.slug && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-ink/20 bg-mint/60 px-2 py-0.5 font-mono text-[10px] font-semibold text-ink">
                    {initialTopic.emoji} pre-filled
                  </span>
                )}
              </div>
              <select
                value={genreSlug}
                onChange={(e) => {
                  setGenreSlug(e.target.value);
                  setSubtopicSlug("");
                }}
                className="mt-1.5 w-full rounded-xl border-2 border-ink bg-cream px-4 py-2.5 font-mono text-sm outline-none ring-coral focus:ring-2"
              >
                <option value="">— Select a subject —</option>
                {CURRICULUM_TOPICS.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.emoji} {t.name}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
            </label>

            {/* Subtopic — only shown when a non-other genre is selected */}
            {genreSlug && genreSlug !== "other" && (
              <label className="block">
                <span className="font-mono text-sm font-semibold text-ink">Subtopic</span>
                <select
                  value={subtopicSlug}
                  onChange={(e) => setSubtopicSlug(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border-2 border-ink bg-cream px-4 py-2.5 font-mono text-sm outline-none ring-coral focus:ring-2"
                >
                  <option value="">— Select a subtopic —</option>
                  {allSubsections.map((s) => (
                    <option key={s.id} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                  <option value="other">Other / General</option>
                </select>
              </label>
            )}

            {/* Level band range picker */}
            <div className="rounded-2xl border-2 border-ink/15 bg-cream p-4">
              <LevelBandRangePicker
                startIdx={levelStart}
                endIdx={levelEnd}
                onChange={handleLevelChange}
              />
            </div>

            {/* Question config */}
            <div>
              <p className="mb-3 font-mono text-sm font-semibold text-ink">
                Generate questions
              </p>
              <div className="flex flex-col gap-2">
                {(Object.entries(questionConfig) as [QuestionType, QuestionConfig][]).map(
                  ([type, cfg]) => (
                    <div
                      key={type}
                      className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-colors ${
                        cfg.enabled
                          ? "border-ink/30 bg-mint/30"
                          : "border-ink/10 bg-cream opacity-60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`q-${type}`}
                        checked={cfg.enabled}
                        onChange={() => toggleQuestionType(type)}
                        className="h-4 w-4 cursor-pointer accent-coral"
                      />
                      <label htmlFor={`q-${type}`} className="flex flex-1 cursor-pointer flex-col">
                        <span className="font-display text-sm font-semibold text-ink">
                          {QUESTION_TYPE_LABELS[type].label}
                        </span>
                        <span className="font-mono text-[10px] text-ink-muted">
                          {QUESTION_TYPE_LABELS[type].description}
                        </span>
                      </label>
                      {cfg.enabled && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setQuestionCount(type, cfg.count - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-ink/30 font-mono text-sm font-bold hover:border-ink"
                            aria-label="Decrease count"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-mono text-sm font-bold">
                            {cfg.count}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuestionCount(type, cfg.count + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-ink/30 font-mono text-sm font-bold hover:border-ink"
                            aria-label="Increase count"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
              {!anyQuestionsEnabled && (
                <p className="mt-2 font-mono text-xs text-ink-muted">
                  No questions will be generated. Enable at least one type, or continue without.
                </p>
              )}
            </div>

            {/* Submit error */}
            {submitError && (
              <p className="rounded-xl border-2 border-coral bg-peach/30 px-4 py-2 font-mono text-xs text-ink">
                {submitError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={submitting}
                className="font-mono text-sm text-ink-muted underline underline-offset-2 hover:text-ink disabled:pointer-events-none disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!step2Valid || submitting}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-coral px-6 py-3 font-display text-lg font-semibold text-offwhite shadow-cartoon transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-cartoon-sm disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-offwhite/40 border-t-offwhite" />
                    Processing…
                  </>
                ) : (
                  "Process notes ✦"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
