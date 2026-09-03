import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export interface ChunkOptions {
  chunkSize?: number; // target character size per chunk (default 750)
  chunkOverlap?: number; // overlap characters between consecutive chunks (default 120)
}

/**
 * Generates a 1536-dimensional vector embedding for the given input text.
 * Uses Gemini API (gemini-embedding-001 or gemini-embedding-2 with outputDimensionality: 1536)
 * or OpenAI text-embedding-3-small / text-embedding-ada-002 if OPENAI_API_KEY is configured.
 */
export async function get1536Embedding(text: string): Promise<number[]> {
  const cleanText = text.trim().replace(/\s+/g, " ");
  if (!cleanText) {
    throw new Error("Cannot generate embedding for empty text.");
  }

  // 1. Check for OpenAI API Key first if user prefers OpenAI
  const openAiKey =
    process.env.OPENAI_API_KEY ||
    (import.meta as any).env?.OPENAI_API_KEY;

  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: cleanText,
          dimensions: 1536,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const vector = json.data?.[0]?.embedding;
        if (Array.isArray(vector) && vector.length === 1536) {
          return vector;
        }
      }
    } catch (err) {
      console.warn("OpenAI embedding attempt failed, falling back to Gemini:", err);
    }
  }

  // 2. Use Gemini API with 1536 output dimensionality
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (!geminiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }

  const candidateModels = ["gemini-embedding-001", "gemini-embedding-2"];
  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: cleanText }] },
          outputDimensionality: 1536,
        }),
      });

      const data = await response.json();
      const values = data?.embedding?.values;

      if (Array.isArray(values) && values.length === 1536) {
        return values;
      }

      if (data?.error) {
        throw new Error(`Gemini embed error (${model}): ${data.error.message || JSON.stringify(data.error)}`);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini embedding with model ${model} failed, trying next fallback...`, err.message);
    }
  }

  // 3. Fallback: try via @google/genai SDK if REST calls encountered unexpected issue
  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const sdkRes = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: cleanText,
      config: { outputDimensionality: 1536 },
    });
    const values = (sdkRes as any).embedding?.values || (sdkRes as any).embeddings?.[0]?.values;
    if (Array.isArray(values) && values.length === 1536) {
      return values;
    }
  } catch (err) {
    // ignore, report last error below
  }

  throw new Error(`Failed to generate 1536-dim embedding: ${lastError?.message || "Unknown error"}`);
}

/**
 * Splits raw document text into overlapping chunks designed for semantic retrieval.
 * Respects paragraph boundaries (\n\n), line breaks (\n), and sentence endings (. ! ?).
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const chunkSize = options.chunkSize ?? 750;
  const chunkOverlap = options.chunkOverlap ?? 120;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Normalize newlines
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  // If entire text fits inside one chunk, return it
  if (normalized.length <= chunkSize) {
    return [normalized];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = start + chunkSize;

    if (end >= normalized.length) {
      const finalChunk = normalized.substring(start).trim();
      if (finalChunk.length >= 20) {
        chunks.push(finalChunk);
      }
      break;
    }

    // Try to find natural break point near the target end
    const searchWindow = normalized.substring(Math.max(start, end - 150), Math.min(normalized.length, end + 50));
    
    // Check in order of preference: paragraph break -> sentence break -> line break -> word break
    let breakIndex = -1;
    
    const doubleNewline = searchWindow.lastIndexOf("\n\n");
    if (doubleNewline !== -1) {
      breakIndex = Math.max(start, end - 150) + doubleNewline + 2;
    } else {
      const sentenceEnd = searchWindow.search(/[\.\!\?]\s+[A-Z0-9]/);
      if (sentenceEnd !== -1) {
        breakIndex = Math.max(start, end - 150) + sentenceEnd + 2;
      } else {
        const singleNewline = searchWindow.lastIndexOf("\n");
        if (singleNewline !== -1) {
          breakIndex = Math.max(start, end - 150) + singleNewline + 1;
        } else {
          const space = searchWindow.lastIndexOf(" ");
          if (space !== -1) {
            breakIndex = Math.max(start, end - 150) + space + 1;
          }
        }
      }
    }

    if (breakIndex !== -1 && breakIndex > start + 100) {
      end = breakIndex;
    }

    const chunk = normalized.substring(start, end).trim();
    if (chunk.length >= 20) {
      chunks.push(chunk);
    }

    // Advance start with overlap
    start = Math.max(start + 1, end - chunkOverlap);
  }

  return chunks;
}

/**
 * Extracts raw textual content from document buffers (PDF, TXT, Markdown, CSV, JSON).
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string,
  filename?: string,
): Promise<string> {
  const isPdf =
    mimeType === "application/pdf" ||
    (filename && filename.toLowerCase().endsWith(".pdf"));

  if (isPdf) {
    try {
      const pdfModule = require("pdf-parse");
      const PDFParseClass = pdfModule.PDFParse || pdfModule.default?.PDFParse;

      if (typeof PDFParseClass === "function") {
        const parser = new PDFParseClass({ data: buffer });
        const res = await parser.getText();
        if (res && res.text) {
          return res.text;
        }
      }

      // Fallback if callable directly
      if (typeof pdfModule === "function") {
        const res = await pdfModule(buffer);
        if (res && res.text) {
          return res.text;
        }
      }
    } catch (err: any) {
      throw new Error(`Failed to parse PDF document (${filename || "unnamed"}): ${err.message}`);
    }
  }

  // Plain text, Markdown, CSV, JSON, etc.
  try {
    return buffer.toString("utf-8");
  } catch (err: any) {
    throw new Error(`Failed to decode text file: ${err.message}`);
  }
}
