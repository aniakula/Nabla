import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import {
  findSubsectionInTaxonomy,
  recordSubsectionView,
} from "@/lib/curriculum/courses";
import { createClient } from "@/lib/supabase/server";
import { LEVEL_BAND_LABELS, type LevelBand } from "@/types/curriculum";
import { notFound, redirect } from "next/navigation";

const LEVEL_BANDS: LevelBand[] = [
  "elementary",
  "middle_school",
  "high_school",
  "advanced",
];

type PageProps = {
  params: Promise<{
    topicSlug: string;
    levelBand: string;
    subsectionSlug: string;
  }>;
};

export default async function SubsectionPage({ params }: PageProps) {
  const { topicSlug, levelBand, subsectionSlug } = await params;

  if (!LEVEL_BANDS.includes(levelBand as LevelBand)) {
    notFound();
  }

  const match = findSubsectionInTaxonomy(
    topicSlug,
    levelBand as LevelBand,
    subsectionSlug
  );
  if (!match) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await recordSubsectionView(supabase, {
    topicSlug,
    levelBand: levelBand as LevelBand,
    subsectionSlug,
  });

  const { topic, subsection } = match;
  const levelLabel = LEVEL_BAND_LABELS[levelBand as LevelBand].label;

  return (
    <PageShell maxWidth="lg">
      <div className="rounded-3xl border-2 border-ink bg-card p-8 shadow-cartoon-lg">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {topic.emoji} {topic.name} · {levelLabel}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">
          {subsection.title}
        </h1>
        <p className="mt-4 font-mono text-sm leading-relaxed text-ink-muted">
          {subsection.description}
        </p>
        <p className="mt-6 font-mono text-sm text-ink-muted">
          Units and lessons for this course are coming next.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/learn" variant="secondary">
            ← All topics
          </Button>
          <Button href="/dashboard">Dashboard</Button>
        </div>
      </div>
    </PageShell>
  );
}
