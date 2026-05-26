import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function PATCH(
  request: Request,
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

  const body = await request.json().catch(() => null);
  if (typeof body?.is_public !== "boolean") {
    return NextResponse.json({ error: "is_public (boolean) required" }, { status: 400 });
  }

  const { is_public } = body as { is_public: boolean };
  const service = createServiceClient();

  // Verify ownership
  const { data: noteSet, error: nsErr } = await service
    .from("note_sets")
    .select("id")
    .eq("id", noteSetId)
    .eq("user_id", user.id)
    .single();

  if (nsErr || !noteSet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Update the note set itself
  const { error: updateErr } = await service
    .from("note_sets")
    .update({ is_public, updated_at: new Date().toISOString() })
    .eq("id", noteSetId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Cascade to all questions in the set
  const { error: qErr } = await service
    .from("note_questions")
    .update({ is_public })
    .eq("note_set_id", noteSetId);

  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, is_public });
}
