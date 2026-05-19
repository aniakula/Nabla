import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <PageShell maxWidth="lg">
      <div className="rounded-3xl border-2 border-ink bg-card p-8 shadow-cartoon-lg">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Coming soon
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">
          Public library 📚
        </h1>
        <p className="mt-4 font-mono text-sm leading-relaxed text-ink-muted">
          Community-contributed curriculum and practice will live here. Premium
          access unlocks the full open library.
        </p>
        <Button href="/dashboard" variant="secondary" className="mt-8">
          ← Back to dashboard
        </Button>
      </div>
    </PageShell>
  );
}
