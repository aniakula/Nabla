import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_instructor, active_mode")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name ??
    (user.user_metadata?.display_name as string | undefined) ??
    user.email;

  const isInstructor = profile?.is_instructor ?? false;

  return (
    <PageShell maxWidth="lg">
      <div className="rounded-3xl border-2 border-ink bg-card p-8 shadow-cartoon-lg">
        <p className="font-mono text-sm font-semibold uppercase tracking-wider text-ink-muted">
          You&apos;re in
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">
          Hey, {displayName}! 👋
        </h1>
        <p className="mt-4 font-mono text-sm text-ink-muted">
          Account type:{" "}
          <span className="rounded-full border-2 border-ink bg-sand px-3 py-0.5 font-semibold text-ink">
            {isInstructor ? "Instructor + Student" : "Student"}
          </span>
        </p>
        {isInstructor && (
          <p className="mt-2 font-mono text-xs text-ink-muted">
            Active mode: {profile?.active_mode ?? "student"} (toggle coming soon)
          </p>
        )}
        <p className="mt-6 font-mono text-sm leading-relaxed text-ink-muted">
          Curriculum, classes, and the open library are on the way. For now,
          you&apos;re set up and signed in.
        </p>
        <form action="/auth/signout" method="post" className="mt-8">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
