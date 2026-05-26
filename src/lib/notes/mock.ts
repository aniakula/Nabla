import type { NotesOutput, QuestionConfig } from "@/types/notes";

/**
 * Returns deterministic fixture data when USE_MOCK_AI=true.
 * Counts adjust based on the requested config so validation always passes.
 */
export function getMockOutput(config: QuestionConfig): NotesOutput {
  const questions: NotesOutput["questions"] = [];

  for (let i = 1; i <= config.mcq_count; i++) {
    questions.push({
      type: "mcq",
      id: `mcq-${i}`,
      question: `[Mock MCQ ${i}] What is the primary purpose of this concept?`,
      options: [
        { id: "a", text: "Option A — correct answer" },
        { id: "b", text: "Option B — distractor" },
        { id: "c", text: "Option C — distractor" },
        { id: "d", text: "Option D — distractor" },
      ],
      correctOptionId: "a",
      explanation: "This is the mock explanation for MCQ " + i,
    });
  }

  for (let i = 1; i <= config.tf_count; i++) {
    questions.push({
      type: "true_false",
      id: `tf-${i}`,
      statement: `[Mock T/F ${i}] This statement is demonstrably true based on the material.`,
      answer: true,
      explanation: "Mock explanation for T/F " + i,
    });
  }

  for (let i = 1; i <= config.frq_count; i++) {
    questions.push({
      type: "frq",
      id: `frq-${i}`,
      question: `[Mock FRQ ${i}] Explain the key idea described in the material.`,
      sampleAnswer:
        "This is a mock sample answer. In a real run the AI would provide a 2–4 sentence response grounded in the source material.",
    });
  }

  for (let i = 1; i <= config.flashcard_count; i++) {
    questions.push({
      type: "flashcard",
      id: `fc-${i}`,
      front: `[Mock Flashcard ${i}] Key Term`,
      back: "Mock definition or answer for this term.",
    });
  }

  return {
    title: "Mock Note Set",
    topics: [
      {
        heading: "Overview",
        content:
          "**Mock summary.** This note set was generated with `USE_MOCK_AI=true` — no real AI call was made.\n\n- Bullet one\n- Bullet two\n- Bullet three",
      },
      {
        heading: "Key Concepts",
        content:
          "Another mock section. Set `USE_MOCK_AI=false` and add a `GROQ_API_KEY` to get real AI-generated notes.",
      },
    ],
    questions,
  };
}
