import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ noteSetId: string }> }
) {
  const { noteSetId } = await params;

  // Still require a logged-in session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();

  // Fetch the note set — must be publicly visible. Join author display name.
  const { data: noteSet, error: nsErr } = await service
    .from("note_sets")
    .select("*, profiles(display_name)")
    .eq("id", noteSetId)
    .eq("is_public", true)
    .single();

  if (nsErr || !noteSet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Resolve author name from the embedded profiles join
  const rawProfiles = noteSet.profiles as
    | { display_name: string }
    | { display_name: string }[]
    | null;
  const authorName = Array.isArray(rawProfiles)
    ? (rawProfiles[0]?.display_name ?? "Unknown")
    : (rawProfiles?.display_name ?? "Unknown");

  // Only return questions that are also public
  const { data: questions } = await service
    .from("note_questions")
    .select("*")
    .eq("note_set_id", noteSetId)
    .eq("is_public", true)
    .order("created_at", { ascending: true });

  // Fetch markdown from private Storage (service role can always read)
  let markdownContent: string | null = null;
  if (noteSet.markdown_path) {
    const { data: blob, error: dlErr } = await service.storage
      .from("note-markdown")
      .download(noteSet.markdown_path);

    if (!dlErr && blob) {
      markdownContent = await blob.text();
    }
  }

  return NextResponse.json({
    noteSet: {
      id: noteSet.id,
      title: noteSet.title,
      topic_slug: noteSet.topic_slug,
      level_band: noteSet.level_band,
      source_filenames: noteSet.source_filenames ?? [],
      created_at: noteSet.created_at,
      is_public: true,
      authorName,
    },
    questions: questions ?? [],
    markdownContent,
  });
}
