import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;

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

  // Verify ownership through the question's note_set
  const { data: question, error: qErr } = await service
    .from("note_questions")
    .select("id, user_id")
    .eq("id", questionId)
    .eq("user_id", user.id)
    .single();

  if (qErr || !question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: updateErr } = await service
    .from("note_questions")
    .update({ is_public })
    .eq("id", questionId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, is_public });
}
