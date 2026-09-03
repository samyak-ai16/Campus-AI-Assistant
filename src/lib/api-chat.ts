import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { get1536Embedding } from "./embeddings";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface ChatResponsePayload {
  content: string;
  sources: Array<{
    id?: string;
    title: string;
    content: string;
    category: string;
    similarity: number;
  }>;
}

/**
 * Execute dynamic RAG retrieval and generate grounded completion.
 */
export async function generateRAGChatResponse(
  messages: ChatMessage[],
  authToken?: string,
): Promise<ChatResponsePayload> {
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY;

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    (import.meta as any).env?.VITE_SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials missing from environment variables.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: authToken
      ? {
          headers: {
            Authorization: authToken.startsWith("Bearer ")
              ? authToken
              : `Bearer ${authToken}`,
          },
        }
      : undefined,
  });

  // Extract latest user message
  const userMessages = messages.filter((m) => m.role === "user");
  const lastUserMessage = userMessages[userMessages.length - 1]?.content ?? "";

  let matchedDocs: Array<{
    id?: string;
    title: string;
    content: string;
    category: string;
    similarity: number;
  }> = [];

  let contextText = "No relevant campus knowledge records found.";

  if (lastUserMessage.trim()) {
    try {
      // 1. Generate 1536-dimensional query embedding
      console.log(`[RAG] Generating 1536-dim embedding for query: "${lastUserMessage.substring(0, 60)}..."`);
      const queryVector = await get1536Embedding(lastUserMessage);

      // 2. Query Supabase vector similarity search via match_knowledge RPC
      const { data, error } = await supabase.rpc("match_knowledge", {
        query_embedding: queryVector,
        match_threshold: 0.25,
        match_count: 5,
      });

      if (error) {
        console.warn("[RAG] Supabase match_knowledge error (table or RPC may need migration):", error.message);
      } else if (data && data.length > 0) {
        matchedDocs = data;
        contextText = matchedDocs
          .map(
            (doc) =>
              `[Document: ${doc.title} | Category: ${doc.category || "General"} | Relevance: ${Math.round(
                (doc.similarity || 0) * 100,
              )}%]\n${doc.content}`,
          )
          .join("\n\n---\n\n");
        console.log(`[RAG] Retrieved ${matchedDocs.length} matching knowledge chunk(s).`);
      } else {
        console.log("[RAG] No matching knowledge chunks exceeded threshold.");
      }
    } catch (err: any) {
      console.error("[RAG Retrieval Warning]:", err.message || err);
    }
  }

  // 3. Prepare AI model and instruction
  const ai = new GoogleGenAI({ apiKey: geminiKey });

  const systemInstruction =
    "You are CampusAI, an official, intelligent, and helpful college assistant for students.\n" +
    "Your objective is to answer user queries accurately based strictly on the admin-provided campus knowledge below.\n\n" +
    "GUIDELINES:\n" +
    "1. Base your answer strictly on the provided OFFICIAL CAMPUS KNOWLEDGE BASE context below.\n" +
    "2. If the relevant facts are in the context, provide a direct, concise, and structured answer. Cite the document title when applicable.\n" +
    "3. If the context does not contain enough information to answer the question, politely inform the student that this information is not found in the official campus records, and guide them to contact the relevant campus department.\n" +
    "4. Never hallucinate, invent dates, policies, codes, or faculty names that are not in the context.\n" +
    "5. Maintain a supportive, polite, and academic tone.\n\n" +
    `OFFICIAL CAMPUS KNOWLEDGE BASE CONTEXT:\n${contextText}`;

  // 4. Format messages for Gemini
  const formattedMessages = messages
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

  // Ensure there is at least one message
  if (formattedMessages.length === 0) {
    formattedMessages.push({
      role: "user",
      parts: [{ text: lastUserMessage || "Hello" }],
    });
  }

  const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-1.5-flash",
  ];

  let response: any = null;
  let lastError: Error | null = null;

  for (const modelName of fallbackModels) {
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: formattedMessages,
        config: {
          systemInstruction,
        },
      });
      if (response?.text) {
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Chat] Model ${modelName} failed, trying fallback:`, err?.message);
    }
  }

  const content =
    response?.text ??
    (lastError
      ? `The AI service is currently unavailable (${lastError.message}). Please try again shortly.`
      : "The AI service is currently experiencing high demand. Please try asking again in a moment.");

  return {
    content,
    sources: matchedDocs,
  };
}

/**
 * Standard HTTP Request handler for POST /api/chat
 */
export async function handleApiChatRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = request.headers.get("authorization") || undefined;

  try {
    const body = (await request.json()) as any;
    let messages: ChatMessage[] = [];

    if (Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (typeof body.message === "string") {
      messages = [{ role: "user", content: body.message }];
    } else if (typeof body.query === "string") {
      messages = [{ role: "user", content: body.query }];
    } else {
      throw new Error("Invalid request body. Expected 'messages' array or 'message' string.");
    }

    const result = await generateRAGChatResponse(messages, authHeader);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[handleApiChatRequest Error]:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Failed to process chat request.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
