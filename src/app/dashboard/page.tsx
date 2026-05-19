import { GreetingWidget } from "@/components/dashboard/GreetingWidget";
import { QuickLinksWidget } from "@/components/dashboard/QuickLinksWidget";
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
    user.email ??
    "there";

  const isInstructor = profile?.is_instructor ?? false;

  return (
    <PageShell maxWidth="xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm font-semibold uppercase tracking-wider text-ink-muted">
          Student dashboard
        </p>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="ghost" className="text-base">
            Sign out
          </Button>
        </form>
      </div>

      <div className="flex min-h-[calc(100vh-12rem)] flex-col gap-5">
        <GreetingWidget
          displayName={displayName}
          isInstructor={isInstructor}
          activeMode={profile?.active_mode}
        />
        <QuickLinksWidget />
      </div>
    </PageShell>
  );
}
