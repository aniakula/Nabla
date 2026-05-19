export type LevelBand =
  | "elementary"
  | "middle_school"
  | "high_school"
  | "advanced";

export type Subsection = {
  id: string;
  slug: string;
  title: string;
  description: string;
};

export type Topic = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  summary: string;
  accent: "mint" | "lavender" | "sky" | "lemon" | "peach" | "sand";
  levels: Record<LevelBand, Subsection[]>;
};

export const LEVEL_BAND_LABELS: Record<
  LevelBand,
  { label: string; grades: string }
> = {
  elementary: { label: "Elementary", grades: "K–5" },
  middle_school: { label: "Middle school", grades: "6–8" },
  high_school: { label: "High school", grades: "9–12" },
  advanced: { label: "Advanced", grades: "College & AP" },
};

export const LEVEL_BAND_ORDER: LevelBand[] = [
  "elementary",
  "middle_school",
  "high_school",
  "advanced",
];

export const LEVEL_BAND_STYLES: Record<
  LevelBand,
  { section: string; chip: string; chipHover: string; badge: string }
> = {
  elementary: {
    section: "bg-level-el/40",
    chip: "bg-level-el",
    chipHover: "hover:bg-level-el/90",
    badge: "bg-level-el/70",
  },
  middle_school: {
    section: "bg-level-ms/40",
    chip: "bg-level-ms",
    chipHover: "hover:bg-level-ms/90",
    badge: "bg-level-ms/70",
  },
  high_school: {
    section: "bg-level-hs/40",
    chip: "bg-level-hs",
    chipHover: "hover:bg-level-hs/90",
    badge: "bg-level-hs/70",
  },
  advanced: {
    section: "bg-level-adv/40",
    chip: "bg-level-adv",
    chipHover: "hover:bg-level-adv/90",
    badge: "bg-level-adv/70",
  },
};
