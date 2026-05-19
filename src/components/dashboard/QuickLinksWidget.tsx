import Link from "next/link";

function QuickLinkCard({
  href,
  emoji,
  title,
  description,
  accent,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`flex h-full min-h-[10rem] flex-col justify-between rounded-2xl border-2 border-ink p-6 shadow-cartoon-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-cartoon ${accent}`}
    >
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <div className="mt-4">
        <p className="font-display text-xl font-bold text-ink">{title}</p>
        <p className="mt-2 font-mono text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>
    </Link>
  );
}

export function QuickLinksWidget() {
  return (
    <div className="flex min-h-[min(24rem,calc(100vh-20rem))] flex-1 flex-col rounded-3xl border-2 border-ink bg-sand/40 p-5 shadow-cartoon-lg">
      <p className="mb-4 px-1 font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
        Your workspace
      </p>
      <div className="grid flex-1 gap-4 sm:grid-cols-2">
        <QuickLinkCard
          href="/library"
          emoji="📚"
          title="Study library"
          description="Community curriculum and practice from contributors."
          accent="bg-lavender/70"
        />
        <QuickLinkCard
          href="/notes"
          emoji="📝"
          title="My notes"
          description="Upload documents and build practice to share publicly."
          accent="bg-mint/70"
        />
      </div>
    </div>
  );
}
