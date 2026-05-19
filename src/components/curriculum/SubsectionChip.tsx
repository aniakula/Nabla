"use client";

import { LEVEL_BAND_STYLES, type LevelBand, type Subsection } from "@/types/curriculum";
import Link from "next/link";

type SubsectionChipProps = {
  topicSlug: string;
  levelBand: LevelBand;
  subsection: Subsection;
};

export function SubsectionChip({
  topicSlug,
  levelBand,
  subsection,
}: SubsectionChipProps) {
  const href = `/learn/${topicSlug}/${levelBand}/${subsection.slug}`;
  const styles = LEVEL_BAND_STYLES[levelBand];

  return (
    <Link
      href={href}
      className={`group box-border flex w-44 shrink-0 grow-0 basis-44 flex-col justify-center rounded-xl border-2 border-ink px-3 py-2.5 text-left shadow-cartoon-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-cartoon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${styles.chip} ${styles.chipHover}`}
    >
      <span className="block font-display text-sm font-semibold leading-snug text-ink group-hover:text-coral">
        {subsection.title}
      </span>
    </Link>
  );
}
