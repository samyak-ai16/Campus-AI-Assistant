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

// In-memory cache for full Q&A responses (TTL: 10 minutes)
const responseCache = new Map<string, { payload: ChatResponsePayload; expires: number }>();
const MAX_RESPONSE_CACHE = 150;
const RESPONSE_TTL_MS = 10 * 60 * 1000;

// Singleton clients to reuse connections and avoid repeated SSL/TLS handshake latency
let cachedAiClient: GoogleGenAI | null = null;
let cachedAiKey: string | null = null;
let cachedSupabaseClient: any = null;
let cachedSupabaseUrl: string | null = null;
let cachedSupabaseKey: string | null = null;

function getAiClient(apiKey: string): GoogleGenAI {
  if (!cachedAiClient || cachedAiKey !== apiKey) {
    cachedAiClient = new GoogleGenAI({ apiKey });
    cachedAiKey = apiKey;
  }
  return cachedAiClient;
}

function getSupabaseClient(url: string, key: string, authToken?: string) {
  if (authToken) {
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          Authorization: authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`,
        },
      },
    });
  }
  if (!cachedSupabaseClient || cachedSupabaseUrl !== url || cachedSupabaseKey !== key) {
    cachedSupabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    cachedSupabaseUrl = url;
    cachedSupabaseKey = key;
  }
  return cachedSupabaseClient;
}

// Fast greeting / pleasantry regex for instant sub-second response
const CASUAL_GREETING_REGEX = /^(hi|hello|hey|heya|howdy|good\s*(morning|afternoon|evening)|who\s*are\s*you|what\s*can\s*you\s*do|help|thanks|thank\s*you|bye|goodbye)[!?. ]*$/i;

/**
 * Execute dynamic RAG retrieval and generate grounded completion with high performance.
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

  // Extract latest user query
  const userMessages = messages.filter((m) => m.role === "user");
  const lastUserMessage = (userMessages[userMessages.length - 1]?.content ?? "").trim();
  const cacheKey = lastUserMessage.toLowerCase();

  // 1. FAST PATH: Check in-memory Q&A cache for instant return (<10ms)
  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse && cachedResponse.expires > Date.now()) {
    return cachedResponse.payload;
  }

  // 2. FAST PATH: Casual greeting bypass (instant sub-second answer without vector lookup)
  if (CASUAL_GREETING_REGEX.test(lastUserMessage)) {
    let greetingAnswer = "Hello! I'm CampusAI, your college assistant. How can I help you today? You can ask me about tomorrow's timetable, upcoming MSE exam dates, attendance rules, or faculty details.";
    if (/^(thanks|thank\s*you)/i.test(lastUserMessage)) {
      greetingAnswer = "You're very welcome! Feel free to ask if you need anything else regarding your classes, exams, or syllabus.";
    } else if (/^(bye|goodbye)/i.test(lastUserMessage)) {
      greetingAnswer = "Goodbye! Best of luck with your studies and have a great day!";
    } else if (/who\s*are\s*you/i.test(lastUserMessage)) {
      greetingAnswer = "I am CampusAI, your official college portal assistant. I have access to your verified campus timetable, MSE exam dates, attendance regulations, and faculty directory.";
    }

    const quickPayload: ChatResponsePayload = {
      content: greetingAnswer,
      sources: [],
    };
    return quickPayload;
  }

  const supabase = getSupabaseClient(supabaseUrl, supabaseKey, authToken);

  let matchedDocs: Array<{
    id?: string;
    title: string;
    content: string;
    category: string;
    similarity: number;
  }> = [];

  let contextText = "No relevant campus knowledge records found.";

  if (lastUserMessage) {
    try {
      // 3. Fast cached 1536-dimensional query embedding
      const queryVector = await get1536Embedding(lastUserMessage);

      // 4. Query Supabase vector similarity search via match_knowledge RPC (top 3 matches for minimal latency)
      const { data, error } = await supabase.rpc("match_knowledge", {
        query_embedding: queryVector,
        match_threshold: 0.22,
        match_count: 3,
      });

      if (error) {
        console.warn("[RAG] Supabase match_knowledge warning:", error.message);
      } else if (data && data.length > 0) {
        matchedDocs = data;
        contextText = matchedDocs
          .map(
            (doc) =>
              `[Document: ${doc.title} | Category: ${doc.category || "General"}]\n${doc.content}`,
          )
          .join("\n\n---\n\n");
      }
    } catch (err: any) {
      console.error("[RAG Retrieval Warning]:", err.message || err);
    }
  }

  // 5. Query Gemini with optimized concise token config and fast models
  const ai = getAiClient(geminiKey);

  const systemInstruction =
    "You are CampusAI, an official, intelligent, and helpful college assistant for students.\n" +
    "Your objective is to answer user queries accurately based strictly on the campus knowledge below.\n\n" +
    "GUIDELINES:\n" +
    "1. Base your answer strictly on the OFFICIAL CAMPUS KNOWLEDGE BASE CONTEXT.\n" +
    "2. Provide a direct, concise, and structured answer. Avoid unnecessary preamble.\n" +
    "3. If the context does not contain enough information, politely inform the student that this information is not in the records and suggest contacting the department.\n" +
    "4. Never hallucinate dates, policies, or faculty names.\n\n" +
    `OFFICIAL CAMPUS KNOWLEDGE BASE CONTEXT:\n${contextText}`;

  // Keep last 4 messages to preserve context while keeping token payload small and fast
  const recentMessages = messages.slice(-4);
  const formattedMessages = recentMessages
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

  if (formattedMessages.length === 0) {
    formattedMessages.push({
      role: "user",
      parts: [{ text: lastUserMessage || "Hello" }],
    });
  }

  // Active production models (gemini-3.6-flash is fastest and most stable)
  const activeModels = ["gemini-3.6-flash", "gemini-3.7-flash"];
  let response: any = null;
  let lastError: Error | null = null;

  for (const modelName of activeModels) {
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: formattedMessages,
        config: {
          systemInstruction,
          maxOutputTokens: 650,
          temperature: 0.2,
        },
      });
      if (response?.text) {
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Chat] Model ${modelName} issue:`, err?.message);
    }
  }

  const content =
    response?.text ??
    (lastError
      ? `The AI service is currently busy (${lastError.message}). Please try again in a moment.`
      : "The AI service is currently experiencing high demand. Please try asking again in a moment.");

  const payload: ChatResponsePayload = {
    content,
    sources: matchedDocs,
  };

  // Cache response for 10 minutes
  if (response?.text && cacheKey) {
    if (responseCache.size > MAX_RESPONSE_CACHE) {
      const firstKey = responseCache.keys().next().value;
      if (firstKey) responseCache.delete(firstKey);
    }
    responseCache.set(cacheKey, { payload, expires: Date.now() + RESPONSE_TTL_MS });
  }

  return payload;
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
