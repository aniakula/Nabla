import Link from "next/link";

function InstructorCard({
  href,
  emoji,
  title,
  description,
  accent,
  comingSoon,
}: {
  href?: string;
  emoji: string;
  title: string;
  description: string;
  accent: string;
  comingSoon?: boolean;
}) {
  const inner = (
    <>
      {comingSoon && (
        <span className="absolute right-3 top-3 rounded-full border border-ink/20 bg-offwhite/80 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-ink-muted">
          Coming soon
        </span>
      )}
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <div className="mt-4">
        <p className="font-display text-xl font-bold text-ink">{title}</p>
        <p className="mt-2 font-mono text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>
    </>
  );

  const base = `relative flex min-h-[10rem] flex-col justify-between rounded-2xl border-2 p-6 ${accent}`;

  if (href && !comingSoon) {
    return (
      <Link
        href={href}
        className={`${base} border-ink shadow-cartoon-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-cartoon`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={`${base} border-ink/30`}>{inner}</div>;
}

export function InstructorWorkspaceWidget() {
  return (
    <div className="flex flex-col rounded-3xl border-2 border-ink bg-lavender/20 p-5 shadow-cartoon-lg">
      <p className="mb-4 px-1 font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
        Instructor workspace
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InstructorCard
          emoji="🏫"
          title="My classes"
          description="Create classes, manage rosters, and track student progress."
          accent="bg-lavender/70"
          comingSoon
        />
        <InstructorCard
          emoji="📋"
          title="Assignments"
          description="Build and assign question sets from the curriculum library."
          accent="bg-sky/70"
          comingSoon
        />
        <InstructorCard
          emoji="✏️"
          title="Grade queue"
          description="Review and grade free-response submissions."
          accent="bg-lemon/70"
          comingSoon
        />
      </div>
    </div>
  );
}
