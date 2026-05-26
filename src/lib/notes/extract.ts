/**
 * Text extraction from uploaded files.
 * PDF  → pdf-parse (Node.js only — kept in serverExternalPackages)
 * TXT  → UTF-8 buffer decode
 */

// Top-level import is required so Next.js correctly externalises pdf-parse
// via serverExternalPackages. A require() inside a function body gets inlined
// by the bundler and loses the external resolution.
import pdfParse from "pdf-parse";

const MAX_CHARS = 80_000;

export async function extractText(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    return extractPdf(buffer);
  }

  if (lower.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: "${filename}". Use PDF or TXT.`);
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text;
}

/**
 * Concatenate text from multiple files and truncate if over the limit.
 * Returns { text, truncated }.
 */
export function mergeAndTruncate(texts: string[]): {
  text: string;
  truncated: boolean;
} {
  const joined = texts.join("\n\n---\n\n");
  if (joined.length <= MAX_CHARS) {
    return { text: joined, truncated: false };
  }
  return {
    text: joined.slice(0, MAX_CHARS),
    truncated: true,
  };
}
