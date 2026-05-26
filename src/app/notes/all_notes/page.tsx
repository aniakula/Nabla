import { NotesGrid } from "@/components/notes/NotesGrid";
import type { NoteSetCardData } from "@/components/notes/NoteSetCard";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

async function getNotesets(userId: string): Promise<NoteSetCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("note_sets")
    .select(
      "id, title, topic_slug, subtopic_slug, level_band, markdown_preview, source_filenames, created_at"
    )
    .eq("user_id", userId)
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

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

export default async function AllNotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const notes = await getNotesets(user.id);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-xs text-ink-muted">
          {notes.length === 0
            ? "No notes yet — add your first one below."
            : `${notes.length} note set${notes.length !== 1 ? "s" : ""}`}
        </p>
        <Button href="/dashboard" variant="ghost" className="text-sm">
          ← Dashboard
        </Button>
      </div>

      <NotesGrid notes={notes} />

      {notes.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <span className="text-5xl" aria-hidden>📝</span>
          <p className="font-display text-xl font-bold text-ink">
            Your notes will live here
          </p>
          <p className="max-w-sm font-mono text-sm leading-relaxed text-ink-muted">
            Click the{" "}
            <span className="font-semibold text-ink">+ New notes</span> card to
            upload documents. Nabla will generate organized summaries and
            practice questions for you.
          </p>
        </div>
      )}
    </div>
  );
}
