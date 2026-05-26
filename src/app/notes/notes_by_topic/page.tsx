import { NotesTopicAccordion } from "@/components/notes/NotesTopicAccordion";
import type { NoteSetCardData } from "@/components/notes/NoteSetCard";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { CURRICULUM_TOPICS } from "@/lib/curriculum/taxonomy";

const OTHER_TOPIC = {
  id: "other" as const,
  slug: "other" as const,
  name: "Other" as const,
  emoji: "📁" as const,
};

async function getNotesByTopic(
  userId: string
): Promise<Record<string, NoteSetCardData[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("note_sets")
    .select(
      "id, title, topic_slug, subtopic_slug, level_band, markdown_preview, source_filenames, created_at"
    )
    .eq("user_id", userId)
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (error || !data) return {};

  const grouped: Record<string, NoteSetCardData[]> = {};
  for (const row of data) {
    const key = row.topic_slug ?? "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: row.id,
      title: row.title,
      topicSlug: row.topic_slug,
      subtopicSlug: row.subtopic_slug,
      levelBand: row.level_band,
      previewText: row.markdown_preview ?? null,
      createdAt: row.created_at,
      sourceFilenames: row.source_filenames ?? [],
    });
  }
  return grouped;
}

export default async function NotesByTopicPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const notesByTopic = await getNotesByTopic(user.id);

  const allTopics = [
    ...CURRICULUM_TOPICS.map((t) => ({ ...t, isOther: false })),
    { ...OTHER_TOPIC, isOther: true },
  ];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-xs text-ink-muted">
          Notes organized by subject
        </p>
        <Button href="/dashboard" variant="ghost" className="text-sm">
          ← Dashboard
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {allTopics.map((topic, index) => {
          const topicNotes = notesByTopic[topic.slug] ?? [];
          return (
            <NotesTopicAccordion
              key={topic.id}
              topic={topic}
              notes={topicNotes}
              defaultOpen={index === 0 || topicNotes.length > 0}
            />
          );
        })}
      </div>
    </div>
  );
}
