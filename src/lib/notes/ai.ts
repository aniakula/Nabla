/**
 * AI model selector — swap the provider in ONE place.
 *
 * Dev / free:   Groq    — set GROQ_API_KEY       (groq.com/developers)
 * Prod default: OpenAI  — set OPENAI_API_KEY      (npm i @ai-sdk/openai)
 * Prod alt:     Anthropic — set ANTHROPIC_API_KEY (npm i @ai-sdk/anthropic)
 *
 * To switch, change the import and the return line below.
 */

import { createGroq } from "@ai-sdk/groq";

export function getNotesModel() {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  // openai/gpt-oss-120b supports strict json_schema structured outputs on Groq
  return groq("openai/gpt-oss-120b");
}

/* ---------- OpenAI example (uncomment + npm i @ai-sdk/openai) ----------
import { createOpenAI } from "@ai-sdk/openai";

export function getNotesModel() {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai("gpt-4o-mini");
}
------------------------------------------------------------------------ */

/* -------- Anthropic example (uncomment + npm i @ai-sdk/anthropic) ------
import { createAnthropic } from "@ai-sdk/anthropic";

export function getNotesModel() {
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic("claude-3-5-haiku-20241022");
}
------------------------------------------------------------------------ */
