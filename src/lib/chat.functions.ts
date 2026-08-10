import { createServerFn } from "@tanstack/react-start";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: ChatMessage[] }) => data)
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    
    if (!key) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // 1. Set up the System Instructions
    const systemInstruction = {
      parts: [{
        text: "You are CampusAI, a friendly and helpful assistant for college students. Help them with questions about attendance, timetables, syllabus, exams, faculty, notices, events, career advice and general study help. Keep answers concise, practical, and formatted in markdown when useful."
      }]
    };

    // 2. Format the chat history for Gemini
    const formattedMessages = data.messages
      .filter(msg => msg.role !== "system") 
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

    try {
      // 3. THE FIX: Changed 'gemini-1.5-flash' to 'gemini-3.5-flash'
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: systemInstruction,
          contents: formattedMessages,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ GEMINI API ERROR (${res.status}):`, text);
        throw new Error(`AI API error: ${res.status} ${text}`);
      }
      
      const json = await res.json();
      
      // 4. Extract the text
      const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't answer that.";
      
      return { content };

    } catch (error) {
      console.error("❌ NETWORK/FETCH ERROR:", error);
      throw error;
    }
  });