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
    return new Response("Unauthorized", { status: 401 });
  }

  const service = createServiceClient();

  const { data: noteSet } = await service
    .from("note_sets")
    .select("title, markdown_path")
    .eq("id", noteSetId)
    .eq("user_id", user.id)
    .single();

  if (!noteSet?.markdown_path) {
    return new Response("Not found", { status: 404 });
  }

  const { data: blob, error } = await service.storage
    .from("note-markdown")
    .download(noteSet.markdown_path);

  if (error || !blob) {
    return new Response("Failed to fetch file", { status: 500 });
  }

  const filename = `${noteSet.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;

  return new Response(blob, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
