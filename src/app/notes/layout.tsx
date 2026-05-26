import { NotesTabs } from "@/components/notes/NotesTabs";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function NotesLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-6">
          <p className="font-mono text-sm font-semibold uppercase tracking-wider text-ink-muted">
            My workspace
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold text-ink md:text-5xl">
            My Notes
          </h1>
        </div>
        <NotesTabs />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
