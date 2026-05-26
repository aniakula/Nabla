import { z } from "zod";

// ---------------------------------------------------------------------------
// Question schemas (Zod — used for AI structured output + runtime validation)
// ---------------------------------------------------------------------------

export const MCQSchema = z.object({
  type: z.literal("mcq"),
  id: z.string(),
  question: z.string(),
  options: z
    .array(z.object({ id: z.string(), text: z.string() }))
    .min(3)
    .max(5),
  correctOptionId: z.string(),
  // Required (not optional) so the JSON schema has all fields in `required`
  // — Groq strict mode rejects schemas with non-required properties.
  // Empty string means the AI chose not to include an explanation.
  explanation: z.string(),
});

export const TrueFalseSchema = z.object({
  type: z.literal("true_false"),
  id: z.string(),
  statement: z.string(),
  answer: z.boolean(),
  explanation: z.string(),
});

export const FRQSchema = z.object({
  type: z.literal("frq"),
  id: z.string(),
  question: z.string(),
  sampleAnswer: z.string(),
});

export const FlashcardSchema = z.object({
  type: z.literal("flashcard"),
  id: z.string(),
  front: z.string(),
  back: z.string(),
});

export const QuestionSchema = z.discriminatedUnion("type", [
  MCQSchema,
  TrueFalseSchema,
  FRQSchema,
  FlashcardSchema,
]);

// ---------------------------------------------------------------------------
// Notes output schema — the object generateObject() must return
// ---------------------------------------------------------------------------

export const TopicSectionSchema = z.object({
  heading: z.string().describe("Concise section heading (e.g. 'Newton's Laws')"),
  content: z
    .string()
    .describe("Markdown-formatted summary for this topic section"),
});

export const NotesOutputSchema = z.object({
  title: z
    .string()
    .describe("Short, descriptive title for the note set inferred from the material"),
  topics: z
    .array(TopicSectionSchema)
    .min(1)
    .describe("One entry per major topic found in the source material"),
  questions: z
    .array(QuestionSchema)
    .describe("All requested questions across all types"),
});

// ---------------------------------------------------------------------------
// TypeScript types
// ---------------------------------------------------------------------------

export type MCQ = z.infer<typeof MCQSchema>;
export type TrueFalse = z.infer<typeof TrueFalseSchema>;
export type FRQ = z.infer<typeof FRQSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type TopicSection = z.infer<typeof TopicSectionSchema>;
export type NotesOutput = z.infer<typeof NotesOutputSchema>;

// ---------------------------------------------------------------------------
// Upload request config (passed from UploadModal → route handler)
// ---------------------------------------------------------------------------

export type QuestionConfig = {
  mcq_count: number;
  tf_count: number;
  frq_count: number;
  flashcard_count: number;
};

export type UploadConfig = QuestionConfig & {
  title: string;
  topic_slug: string;
  subtopic_slug: string;
  level_band: string;
};

// ---------------------------------------------------------------------------
// DB row types (from note_sets / note_questions)
// ---------------------------------------------------------------------------

export type NoteSetStatus = "processing" | "ready" | "failed";

export type NoteSet = {
  id: string;
  user_id: string;
  title: string;
  topic_slug: string | null;
  subtopic_slug: string | null;
  level_band: string | null;
  markdown_path: string | null;
  status: NoteSetStatus;
  is_public: boolean;
  source_filenames: string[];
  created_at: string;
  updated_at: string;
};

export type NoteQuestion = {
  id: string;
  note_set_id: string;
  user_id: string;
  type: "mcq" | "true_false" | "frq" | "flashcard";
  question_data: Question;
  is_public: boolean;
  created_at: string;
};
