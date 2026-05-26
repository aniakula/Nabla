import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ noteSetId: string }> }
) {
  const { noteSetId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();

  // Fetch note set (verify ownership)
  const { data: noteSet, error: nsErr } = await service
    .from("note_sets")
    .select("*")
    .eq("id", noteSetId)
    .eq("user_id", user.id)
    .single();

  if (nsErr || !noteSet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch questions
  const { data: questions } = await service
    .from("note_questions")
    .select("*")
    .eq("note_set_id", noteSetId)
    .order("created_at", { ascending: true });

  // Fetch markdown from Storage
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
    noteSet,
    questions: questions ?? [],
    markdownContent,
  });
}
