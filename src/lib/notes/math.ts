/**
 * Convert LaTeX delimiters from the formats AI models commonly output
 * into the $...$ / $$...$$ format that remark-math expects.
 *
 * Handles:
 *   \( ... \)  →  $ ... $     (inline)
 *   \[ ... \]  →  $$ ... $$   (display / block)
 */
export function normalizeLatex(text: string): string {
  return text
    .replace(/\\\[/g, "$$$$")   // \[ → $$  (must come before \( to avoid partial match)
    .replace(/\\\]/g, "$$$$")   // \] → $$
    .replace(/\\\(/g, "$")      // \( → $
    .replace(/\\\)/g, "$");     // \) → $
}
