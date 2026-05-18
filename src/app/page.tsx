import { InstructorLink } from "@/app/onboarding/InstructorLink";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo size="lg" />
        <Button href="/login" variant="ghost" className="text-base">
          Log in
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="relative overflow-hidden rounded-[2.5rem] border-2 border-ink bg-offwhite px-8 py-16 shadow-cartoon-lg md:px-14 md:py-20">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-lemon/80 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/4 h-48 w-48 rounded-full bg-mint/60 blur-2xl" />
          <div className="pointer-events-none absolute bottom-8 right-1/4 h-32 w-32 rounded-full bg-lavender/70 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sand px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider">
              <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
              open-source education
            </p>
            <h1 className="text-balance font-display text-5xl font-bold leading-tight text-ink md:text-6xl">
              Learn together.
              <br />
              <span className="text-coral">Teach together.</span>
            </h1>
            <p className="mt-6 max-w-lg font-mono text-base leading-relaxed text-ink-muted md:text-lg">
              Nabla is a growing library of curriculum built by students and
              instructors — readings, practice, and real classroom tools, all
              in one cartoony-little corner of the internet.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="/onboarding">Get started</Button>
              <InstructorLink>I&apos;m an instructor</InstructorLink>
            </div>
          </div>

          <div className="relative z-10 mt-14 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Base library", value: "Free", color: "bg-mint" },
              { label: "Community uploads", value: "Open", color: "bg-lavender" },
              { label: "Your classroom", value: "Live", color: "bg-sky" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border-2 border-ink ${stat.color} p-4 shadow-cartoon`}
              >
                <p className="font-mono text-xs font-semibold uppercase text-ink-muted">
                  {stat.label}
                </p>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              emoji: "📚",
              title: "Structured paths",
              body: "Math, science, and more — genres, subtopics, and units that actually make sense.",
            },
            {
              emoji: "🛠️",
              title: "Built in the open",
              body: "Upload PDFs or create lessons in-app. The library grows with every contributor.",
            },
            {
              emoji: "🎓",
              title: "Classroom ready",
              body: "Instructors run classes, assign work, and switch to student mode anytime.",
            },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border-2 border-ink bg-card p-6 shadow-cartoon transition-transform hover:-translate-y-1"
            >
              <span className="text-3xl">{card.emoji}</span>
              <h2 className="mt-3 font-display text-xl font-bold">{card.title}</h2>
              <p className="mt-2 font-mono text-sm leading-relaxed text-ink-muted">
                {card.body}
              </p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
