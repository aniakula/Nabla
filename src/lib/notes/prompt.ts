import type { QuestionConfig } from "@/types/notes";

type PromptContext = {
  text: string;
  truncated: boolean;
  config: QuestionConfig;
  topicSlug: string;
  subtopicSlug: string;
  levelBand: string;
};

export function buildSystemPrompt(): string {
  return `You are an expert educational content creator. Your job is to read student notes or textbook material and produce:
1. A structured, topic-by-topic markdown summary.
2. A set of study questions exactly matching the requested counts and types.

Rules:
- Write summaries in clear, concise markdown. Use bullet points and bold for key terms.
- ANY text in questions, answers, or explanations that is a formula or equation must be wrapped in proper LaTeX formatting.
- Group content into logical topic sections. Do not merge unrelated concepts.
- Generate EXACTLY the requested number of each question type. If the material is insufficient for a type, generate fewer rather than inventing content — but aim to meet the count.
- Every question must have a unique "id" field (use short slugs like "mcq-1", "tf-3", "frq-2", "fc-4").
- MCQ options must have ids "a", "b", "c", "d". correctOptionId must match one of the option ids.
- Explanations are encouraged for MCQ and True/False.
- FRQ sample answers should be 2–4 sentences.
- Flashcard fronts should be terms or short questions; backs should be concise definitions or answers.
- Return valid JSON matching the schema exactly — no extra fields, no markdown fences around the JSON.`;
}

export function buildUserPrompt(ctx: PromptContext): string {
  const { text, truncated, config, topicSlug, subtopicSlug, levelBand } = ctx;

  const questionRequest = [
    config.mcq_count > 0 ? `${config.mcq_count} multiple-choice (MCQ)` : null,
    config.tf_count > 0 ? `${config.tf_count} true/false` : null,
    config.frq_count > 0 ? `${config.frq_count} free-response (FRQ)` : null,
    config.flashcard_count > 0
      ? `${config.flashcard_count} flashcards`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  const contextLine = [
    topicSlug && topicSlug !== "other" ? `Subject: ${topicSlug}` : null,
    subtopicSlug && subtopicSlug !== "other"
      ? `Subtopic: ${subtopicSlug}`
      : null,
    levelBand ? `Level: ${levelBand.replace(/_/g, " ")}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return [
    contextLine ? `Context — ${contextLine}` : null,
    truncated
      ? "⚠️ Note: source text was truncated to ~80,000 characters. Summarise what is available."
      : null,
    "",
    "Please produce:",
    `1. A topic-by-topic markdown summary of the material below.`,
    questionRequest
      ? `2. Exactly the following questions: ${questionRequest}.`
      : "2. No questions are required.",
    "",
    "--- SOURCE MATERIAL START ---",
    text,
    "--- SOURCE MATERIAL END ---",
  ]
    .filter((l) => l !== null)
    .join("\n");
}
