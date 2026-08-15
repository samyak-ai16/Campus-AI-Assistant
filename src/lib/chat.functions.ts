import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: ChatMessage[] }) => data)
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    if (!key) throw new Error("GEMINI_API_KEY not configured");
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials missing");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get the latest question from the user
    const userMessages = data.messages.filter((m) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content ?? "";

    let contextText = "No specific handbook matches found.";

    try {
      // 2. Convert user question to an embedding vector
      const embedRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: lastUserMessage }] },
          }),
        }
      );

      const embedData = await embedRes.json();
      const queryVector = embedData.embedding?.values;

      if (queryVector) {
        // 3. Search Supabase pgvector for top 4 relevant chunks
        const { data: matchedDocs } = await supabase.rpc("match_college_documents", {
          query_embedding: queryVector,
          match_threshold: 0.3,
          match_count: 4,
        });

        if (matchedDocs && matchedDocs.length > 0) {
          contextText = matchedDocs
            .map((doc: any) => `[Source: ${doc.metadata?.pdf_name || "Document"}]\n${doc.content}`)
            .join("\n\n---\n\n");
        }
      }
    } catch (err) {
      console.error("⚠️ Vector search failed, falling back to general assistant mode:", err);
    }

    // 4. Pass official context into Gemini system prompt
    const systemInstruction = {
      parts: [
        {
          text:
            "You are CampusAI, a friendly and helpful assistant for college students. " +
            "Use the provided official college document context below to answer the student's question accurately. " +
            "If the answer is found in the context, cite facts directly. If not found, inform the student and answer as a general college helper.\n\n" +
            `OFFICIAL COLLEGE CONTEXT:\n${contextText}`,
        },
      ],
    };

    // 5. Format messages for Gemini
    const formattedMessages = data.messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // 6. Call Gemini model
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction,
          contents: formattedMessages,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI API error: ${res.status} ${text}`);
    }

    const json = await res.json();
    const content: string =
      json.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't answer that.";

    return { content };
  });