"use client";

import type { AccountRole } from "@/lib/onboarding";

type RoleCardProps = {
  role: AccountRole;
  title: string;
  description: string;
  emoji: string;
  accent: "mint" | "lavender" | "sky" | "peach";
  selected: boolean;
  onSelect: (role: AccountRole) => void;
};

const accents = {
  mint: "bg-mint hover:bg-mint/90",
  lavender: "bg-lavender hover:bg-lavender/90",
  sky: "bg-sky hover:bg-sky/90",
  peach: "bg-peach hover:bg-peach/90",
};

export function RoleCard({
  role,
  title,
  description,
  emoji,
  accent,
  selected,
  onSelect,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={`group w-full rounded-3xl border-2 border-ink p-6 text-left transition-all ${
        selected
          ? `${accents[accent]} shadow-cartoon-lg -translate-y-1`
          : "bg-card shadow-cartoon hover:-translate-y-0.5 hover:shadow-cartoon-lg"
      }`}
    >
      <span className="mb-4 block text-4xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="font-display text-2xl font-bold text-ink">{title}</h3>
      <p className="mt-2 font-mono text-sm leading-relaxed text-ink-muted">
        {description}
      </p>
      <span
        className={`mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink px-3 py-1 font-mono text-xs font-semibold ${
          selected ? "bg-offwhite" : "bg-sand/50 opacity-0 group-hover:opacity-100"
        } ${selected ? "opacity-100" : ""}`}
      >
        {selected ? "✓ selected" : "click to select"}
      </span>
    </button>
  );
}
