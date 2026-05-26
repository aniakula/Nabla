import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { extractText, mergeAndTruncate } from "@/lib/notes/extract";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/notes/prompt";
import { getMockOutput } from "@/lib/notes/mock";
import { getNotesModel } from "@/lib/notes/ai";
import { NotesOutputSchema } from "@/types/notes";
import type { QuestionConfig, UploadConfig } from "@/types/notes";

// Vercel Hobby ceiling — increase to 300 on Pro if needed
export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_BATCH_BYTES = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_TYPES = new Set(["application/pdf", "text/plain"]);

export async function POST(request: Request) {
  // -------------------------------------------------------------------------
  // 1. Auth check
  // -------------------------------------------------------------------------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // -------------------------------------------------------------------------
  // 2. Parse + validate multipart form data
  // -------------------------------------------------------------------------
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const rawFiles = formData.getAll("files") as File[];
  if (!rawFiles || rawFiles.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Validate individual file types and sizes
  for (const file of rawFiles) {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    const isTxt =
      file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

    if (!ACCEPTED_TYPES.has(file.type) && !isPdf && !isTxt) {
      return NextResponse.json(
        { error: `"${file.name}" is not a supported type. Use PDF or TXT.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" exceeds the 10 MB per-file limit.` },
        { status: 400 }
      );
    }
  }

  const totalBytes = rawFiles.reduce((acc, f) => acc + f.size, 0);
  if (totalBytes > MAX_BATCH_BYTES) {
    return NextResponse.json(
      { error: "Total batch exceeds 25 MB." },
      { status: 400 }
    );
  }

  // Parse config fields from form data
  const title = (formData.get("title") as string | null)?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const config: UploadConfig = {
    title,
    topic_slug: (formData.get("topic_slug") as string) || "other",
    subtopic_slug: (formData.get("subtopic_slug") as string) || "other",
    level_band: (formData.get("level_band") as string) || "",
    mcq_count: Number(formData.get("mcq_count") ?? 0),
    tf_count: Number(formData.get("tf_count") ?? 0),
    frq_count: Number(formData.get("frq_count") ?? 0),
    flashcard_count: Number(formData.get("flashcard_count") ?? 0),
  };

  const qConfig: QuestionConfig = {
    mcq_count: config.mcq_count,
    tf_count: config.tf_count,
    frq_count: config.frq_count,
    flashcard_count: config.flashcard_count,
  };

  // -------------------------------------------------------------------------
  // 3. Create note_set row (status: processing) using service client
  // -------------------------------------------------------------------------
  const service = createServiceClient();

  const { data: noteSetRow, error: insertErr } = await service
    .from("note_sets")
    .insert({
      user_id: user.id,
      title: config.title,
      topic_slug: config.topic_slug,
      subtopic_slug: config.subtopic_slug,
      level_band: config.level_band || null,
      status: "processing",
      source_filenames: rawFiles.map((f) => f.name),
    })
    .select("id")
    .single();

  if (insertErr || !noteSetRow) {
    console.error("Failed to create note_set:", insertErr);
    return NextResponse.json(
      { error: "Failed to create note set" },
      { status: 500 }
    );
  }

  const noteSetId: string = noteSetRow.id;

  try {
    // -----------------------------------------------------------------------
    // 4. Extract text from each file
    // -----------------------------------------------------------------------
    const texts: string[] = [];
    for (const file of rawFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractText(buffer, file.name);
      texts.push(text);
    }

    const { text, truncated } = mergeAndTruncate(texts);

    // -----------------------------------------------------------------------
    // 5. Generate notes via AI (or mock)
    // -----------------------------------------------------------------------
    let output;

    if (process.env.USE_MOCK_AI === "true") {
      output = getMockOutput(qConfig);
    } else {
      const { object } = await generateObject({
        model: getNotesModel(),
        schema: NotesOutputSchema,
        system: buildSystemPrompt(),
        prompt: buildUserPrompt({
          text,
          truncated,
          config: qConfig,
          topicSlug: config.topic_slug,
          subtopicSlug: config.subtopic_slug,
          levelBand: config.level_band,
        }),
      });
      output = object;
    }

    // -----------------------------------------------------------------------
    // 6. Assemble markdownFull from topics
    // -----------------------------------------------------------------------
    const markdownFull = [
      `# ${output.title}`,
      "",
      ...output.topics.flatMap((t) => [`## ${t.heading}`, "", t.content, ""]),
    ].join("\n");

    // -----------------------------------------------------------------------
    // 7. Save markdown to Supabase Storage (note-markdown bucket)
    // -----------------------------------------------------------------------
    const markdownPath = `${user.id}/${noteSetId}.md`;
    const { error: storageErr } = await service.storage
      .from("note-markdown")
      .upload(markdownPath, markdownFull, {
        contentType: "text/markdown",
        upsert: true,
      });

    if (storageErr) {
      // Non-fatal: we can still save questions and mark ready; log the error
      console.warn("Storage upload failed:", storageErr.message);
    }

    // -----------------------------------------------------------------------
    // 8. Bulk-insert questions
    // -----------------------------------------------------------------------
    if (output.questions.length > 0) {
      const rows = output.questions.map((q) => ({
        note_set_id: noteSetId,
        user_id: user.id,
        type: q.type,
        question_data: q,
      }));

      const { error: qErr } = await service
        .from("note_questions")
        .insert(rows);

      if (qErr) {
        console.error("Failed to insert questions:", qErr);
      }
    }

    // -----------------------------------------------------------------------
    // 9. Update note_set → ready (+ markdown_preview for card display)
    // -----------------------------------------------------------------------
    // Keep raw markdown (including LaTeX) for the card preview.
    // Rendering happens in the modal; the card shows the notation as-is.
    const markdownPreview = markdownFull
      .split("\n")
      .filter((l) => l.trim().length > 0)   // drop blank lines
      .slice(0, 8)                           // first 8 non-empty lines
      .join("\n")
      .slice(0, 400);

    await service
      .from("note_sets")
      .update({
        status: "ready",
        markdown_path: storageErr ? null : markdownPath,
        markdown_preview: markdownPreview,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteSetId);

    return NextResponse.json({ noteSetId });
  } catch (err) {
    console.error("Notes pipeline error:", err);

    // Mark failed so the UI can surface the error
    await service
      .from("note_sets")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", noteSetId);

    const message =
      err instanceof Error ? err.message : "Processing failed. Please retry.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
