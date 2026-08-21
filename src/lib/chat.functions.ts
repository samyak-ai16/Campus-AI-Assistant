import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@xenova/transformers";
import { GoogleGenAI } from "@google/genai";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// Singleton instance for local embedding feature extractor (384 dimensions)
let localExtractor: any = null;

async function getLocalEmbedding(text: string): Promise<number[]> {
  if (!localExtractor) {
    localExtractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  const output = await localExtractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: ChatMessage[] }) => data)
  .handler(async ({ data }) => {
    // 1. Retrieve keys across process.env and import.meta.env
    const key =
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.GEMINI_API_KEY ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY;

    const supabaseUrl =
      process.env.VITE_SUPABASE_URL ||
      (import.meta as any).env?.VITE_SUPABASE_URL;

    const supabaseKey =
      process.env.VITE_SUPABASE_ANON_KEY ||
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    // Server log to verify key availability during runtime requests
    console.log("Env Check:", {
      hasKey: !!key,
      procGemini: !!process.env.GEMINI_API_KEY,
      procViteGemini: !!process.env.VITE_GEMINI_API_KEY,
      metaGemini: !!(import.meta as any).env?.GEMINI_API_KEY,
      metaViteGemini: !!(import.meta as any).env?.VITE_GEMINI_API_KEY,
    });

    if (!key) throw new Error("GEMINI_API_KEY is missing from environment variables (.env)");
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials missing from environment variables (.env)");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Get latest question from user
    const userMessages = data.messages.filter((m) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content ?? "";

    let contextText = "No specific handbook matches found.";

    try {
      // 3. Generate 384-dim query vector matching local upload script
      const queryVector = await getLocalEmbedding(lastUserMessage);

      if (queryVector) {
        // 4. Query Supabase pgvector for top 4 relevant chunks
        const { data: matchedDocs, error: rpcError } = await supabase.rpc("match_college_documents", {
          query_embedding: queryVector,
          match_threshold: 0.3,
          match_count: 4,
        });

        if (rpcError) {
          console.error("Supabase vector search error:", rpcError.message);
        } else if (matchedDocs && matchedDocs.length > 0) {
          contextText = matchedDocs
            .map((doc: any) => `[Source: ${doc.metadata?.source || doc.metadata?.pdf_name || "Document"}]\n${doc.content}`)
            .join("\n\n---\n\n");
        }
      }
    } catch (err) {
      console.error("⚠️ Vector search failed, falling back to general assistant mode:", err);
    }

    // 5. Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey: key });

    // 6. Format chat history for Gemini API
    const formattedMessages = data.messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // 7. Request completion using active model alias
const response = await ai.models.generateContent({
  model: "gemini-1.5-flash", // 👈 Change "gemini-2.5-flash" to "gemini-1.5-flash"
  contents: formattedMessages,
  config: {
    systemInstruction:
      "You are CampusAI, a friendly and helpful assistant for college students. " +
      "Use the provided official college document context below to answer the student's question accurately. " +
      "If the answer is found in the context, cite facts directly. If not found, inform the student and answer as a general college helper.\n\n" +
      `OFFICIAL COLLEGE CONTEXT:\n${contextText}`,
  },
});

    const content = response.text ?? "Sorry, I couldn't answer that.";

    return { content };
  });