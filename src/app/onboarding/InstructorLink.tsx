"use client";

import { setPendingRole } from "@/lib/onboarding";
import Link from "next/link";

/** Sets instructor role before navigating to onboarding (for landing CTA). */
export function InstructorLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/onboarding"
      onClick={() => setPendingRole("instructor")}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-mint px-6 py-3 font-display text-lg font-semibold text-ink shadow-cartoon transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-cartoon-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      {children}
    </Link>
  );
}
