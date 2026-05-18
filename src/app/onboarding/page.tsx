"use client";

import { RoleCard } from "@/components/onboarding/RoleCard";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import {
  type AccountRole,
  getPendingRole,
  setPendingRole,
} from "@/lib/onboarding";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountRole | null>(null);

  useEffect(() => {
    setSelected(getPendingRole());
  }, []);

  function handleContinue() {
    if (!selected) return;
    setPendingRole(selected);
    router.push("/signup");
  }

  return (
    <PageShell maxWidth="xl">
      <div className="mb-10 text-center">
        <p className="font-mono text-sm font-semibold uppercase tracking-wider text-ink-muted">
          Step 1 of 2
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink md:text-5xl">
          Who are you here as?
        </h1>
        <p className="mx-auto mt-3 max-w-lg font-mono text-sm text-ink-muted md:text-base">
          Pick one to start — instructors also get a full student account and
          can switch modes anytime.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RoleCard
          role="student"
          title="Student"
          description="Browse curriculum, join classes, practice problems, and find tutors."
          emoji="🎒"
          accent="sky"
          selected={selected === "student"}
          onSelect={setSelected}
        />
        <RoleCard
          role="instructor"
          title="Instructor"
          description="Run classes, assign work, contribute to the open library — plus everything students get."
          emoji="📐"
          accent="lavender"
          selected={selected === "instructor"}
          onSelect={setSelected}
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selected}
          className="min-w-[200px]"
        >
          Continue to sign up
        </Button>
        <Button href="/" variant="ghost">
          Back to home
        </Button>
      </div>

      {selected && (
        <p className="mt-6 text-center font-mono text-xs text-ink-muted">
          {selected === "instructor"
            ? "You'll get instructor + student access after signup."
            : "You'll get student access after signup."}
        </p>
      )}
    </PageShell>
  );
}
