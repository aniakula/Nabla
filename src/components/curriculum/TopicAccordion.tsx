"use client";

import { SubsectionChip } from "@/components/curriculum/SubsectionChip";
import {
  LEVEL_BAND_LABELS,
  LEVEL_BAND_ORDER,
  LEVEL_BAND_STYLES,
  type Topic,
} from "@/types/curriculum";
import { type ReactNode, useId, useState } from "react";

const accentStyles: Record<Topic["accent"], string> = {
  mint: "bg-mint",
  lavender: "bg-lavender",
  sky: "bg-sky",
  lemon: "bg-lemon",
  peach: "bg-peach",
  sand: "bg-sand",
};

type TopicAccordionProps = {
  topic: Topic;
  defaultOpen?: boolean;
};

export function TopicAccordion({ topic, defaultOpen = false }: TopicAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const headerId = useId();

  return (
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
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-ink text-2xl shadow-cartoon-sm ${accentStyles[topic.accent]}`}
          aria-hidden
        >
          {topic.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-xl font-bold text-ink">
            {topic.name}
          </span>
          <span className="mt-0.5 block font-mono text-xs text-ink-muted">
            {topic.summary}
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
        <TopicPanel id={panelId} labelledBy={headerId}>
          <div className="flex flex-col gap-4 px-5 pb-6 pt-2">
            {LEVEL_BAND_ORDER.map((band) => {
              const subsections = topic.levels[band];
              const { label, grades } = LEVEL_BAND_LABELS[band];
              const levelStyles = LEVEL_BAND_STYLES[band];

              return (
                <section
                  key={band}
                  className={`min-w-0 rounded-2xl border-2 border-ink/15 p-3 ${levelStyles.section}`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2 px-0.5">
                    <h3 className="font-display text-sm font-bold text-ink">
                      {label}
                    </h3>
                    <span
                      className={`rounded-full border border-ink/25 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-muted ${levelStyles.badge}`}
                    >
                      {grades}
                    </span>
                  </div>
                  <ul
                    className="subsection-scroll -mx-0.5 flex list-none flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-0.5 py-2"
                    aria-label={`${label} subsections`}
                  >
                    {subsections.map((subsection) => (
                      <li key={subsection.id} className="flex shrink-0">
                        <SubsectionChip
                          topicSlug={topic.slug}
                          levelBand={band}
                          subsection={subsection}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </TopicPanel>
      )}
    </article>
  );
}

function TopicPanel({
  id,
  labelledBy,
  children,
}: {
  id: string;
  labelledBy: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      className="border-t-2 border-ink/10"
    >
      {children}
    </div>
  );
}
