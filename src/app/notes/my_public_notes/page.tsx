import { NotesGrid } from "@/components/notes/NotesGrid";
import type { NoteSetCardData } from "@/components/notes/NoteSetCard";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

async function getMyPublicNotes(userId: string): Promise<NoteSetCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("note_sets")
    .select(
      "id, title, topic_slug, subtopic_slug, level_band, markdown_preview, source_filenames, created_at"
    )
    .eq("user_id", userId)
    .eq("is_public", true)
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("My public notes fetch error:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    topicSlug: row.topic_slug,
    subtopicSlug: row.subtopic_slug,
    levelBand: row.level_band,
    previewText: row.markdown_preview ?? null,
    createdAt: row.created_at,
    sourceFilenames: row.source_filenames ?? [],
  }));
}

export default async function MyPublicNotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const notes = await getMyPublicNotes(user.id);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-xs text-ink-muted">
          {notes.length === 0
            ? "None of your notes are public yet."
            : `${notes.length} public note set${notes.length !== 1 ? "s" : ""} — visible to everyone`}
        </p>
        <Button href="/dashboard" variant="ghost" className="text-sm">
          ← Dashboard
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex min-h-[20rem] items-center justify-center rounded-3xl border-2 border-dashed border-ink/20 bg-offwhite/50">
          <div className="text-center">
            <p className="font-display text-5xl font-bold text-ink/20">🔒</p>
            <p className="mt-3 font-display text-xl font-bold text-ink/40">
              No public notes yet
            </p>
            <p className="mt-1 max-w-xs font-mono text-sm text-ink-muted">
              Open a note in{" "}
              <span className="font-semibold text-ink">All Notes</span> and
              toggle it public to share it here.
            </p>
          </div>
        </div>
      ) : (
        <NotesGrid notes={notes} showAdd={false} />
      )}
    </div>
  );
}
