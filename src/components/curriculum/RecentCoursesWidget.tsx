import { coursePath, type RecentCourseRow } from "@/lib/curriculum/courses";
import { LEVEL_BAND_LABELS } from "@/types/curriculum";
import Link from "next/link";

export function RecentCoursesWidget({
  recentCourses,
}: {
  recentCourses: RecentCourseRow[];
}) {
  if (recentCourses.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border-2 border-ink bg-offwhite p-5 shadow-cartoon">
      <div className="mb-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Jump back in
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">
          Recent courses
        </h2>
        <p className="mt-1 font-mono text-xs text-ink-muted">
          Sorted by how often you open them
        </p>
      </div>

      <ul
        className="subsection-scroll -mx-0.5 flex list-none flex-nowrap gap-3 overflow-x-auto overscroll-x-contain px-0.5 py-2"
        aria-label="Recent courses"
      >
        {recentCourses.map(({ course, view_count }) => {
          const levelLabel = LEVEL_BAND_LABELS[course.level_band].label;

          return (
            <li key={course.id} className="flex shrink-0 py-0.5">
              <Link
                href={coursePath(course)}
                className="group flex w-52 flex-col gap-2 rounded-2xl border-2 border-ink bg-card p-4 shadow-cartoon-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-cartoon"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-sand text-lg"
                    aria-hidden
                  >
                    {course.topic_emoji ?? "📘"}
                  </span>
                  {view_count > 1 && (
                    <span className="rounded-full border border-ink/30 bg-peach/50 px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-muted">
                      {view_count}×
                    </span>
                  )}
                </span>
                <span className="block font-display text-base font-bold leading-snug text-ink group-hover:text-coral">
                  {course.title}
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  {course.topic_name} · {levelLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
