import { RecentCoursesWidget } from "@/components/curriculum/RecentCoursesWidget";
import { TopicAccordion } from "@/components/curriculum/TopicAccordion";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { CURRICULUM_TOPICS } from "@/lib/curriculum/taxonomy";
import { getRecentCoursesForUser } from "@/lib/curriculum/courses";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recentCourses = await getRecentCoursesForUser(supabase, user.id);

  return (
    <PageShell maxWidth="xl">
      <header>
        <p className="font-mono text-sm font-semibold uppercase tracking-wider text-ink-muted">
          Student library
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink md:text-5xl">
          Pick a topic to explore
        </h1>
        <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-ink-muted">
          Open a subject to see subsections by school level, or jump back into a
          recent course below.
        </p>
        <Button href="/dashboard" variant="ghost" className="mt-6 text-base">
          ← Back to dashboard
        </Button>
      </header>

      <div className="mt-8">
        <RecentCoursesWidget recentCourses={recentCourses} />
      </div>

      <div className="mt-10 flex flex-col gap-5">
        {CURRICULUM_TOPICS.map((topic, index) => (
          <TopicAccordion key={topic.id} topic={topic} defaultOpen={index === 0} />
        ))}
      </div>
    </PageShell>
  );
}
