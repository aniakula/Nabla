import { PublicLibraryGrid, type PublicNoteItem } from "@/components/notes/PublicLibraryGrid";
import { PageShell } from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";

async function getAllPublicNotes(): Promise<PublicNoteItem[]> {
  const service = createServiceClient();

  const { data, error } = await service
    .from("note_sets")
    .select("*, profiles(display_name)")
    .eq("is_public", true)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    console.error("Library fetch error:", error);
    return [];
  }

  return data.map((row) => {
    const rawProfiles = row.profiles as
      | { display_name: string }
      | { display_name: string }[]
      | null;
    const authorName = Array.isArray(rawProfiles)
      ? (rawProfiles[0]?.display_name ?? "Unknown")
      : (rawProfiles?.display_name ?? "Unknown");

    return {
      id: row.id,
      title: row.title,
      topicSlug: row.topic_slug,
      subtopicSlug: row.subtopic_slug,
      levelBand: row.level_band,
      previewText: row.markdown_preview ?? null,
      createdAt: row.created_at,
      sourceFilenames: row.source_filenames ?? [],
      authorName,
    };
  });
}

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const notes = await getAllPublicNotes();

  return (
    <PageShell maxWidth="xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Public library
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold text-ink md:text-5xl">
            Study library 📚
          </h1>
        </div>
        <Button href="/dashboard" variant="ghost" className="text-sm">
          ← Dashboard
        </Button>
      </div>

      <p className="mb-6 font-mono text-xs text-ink-muted">
        {notes.length === 0
          ? "No public notes yet — be the first to share one."
          : `${notes.length} public note set${notes.length !== 1 ? "s" : ""} from the community`}
      </p>

      <PublicLibraryGrid notes={notes} />
    </PageShell>
  );
}
