"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "All Notes", href: "/notes/all_notes" },
  { label: "By Topic", href: "/notes/notes_by_topic" },
  { label: "My Public Notes", href: "/notes/my_public_notes" },
];

export function NotesTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-2"
      aria-label="Notes views"
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-2xl border-2 px-5 py-2 font-display text-base font-semibold transition-all ${
              active
                ? "border-ink bg-coral text-offwhite shadow-cartoon"
                : "border-ink bg-card text-ink shadow-cartoon-sm hover:-translate-y-0.5 hover:bg-sand hover:shadow-cartoon"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
