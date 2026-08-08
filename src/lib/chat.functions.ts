import { createServerFn } from "@tanstack/react-start";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: ChatMessage[] }) => data)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt: ChatMessage = {
      role: "system",
      content:
        "You are CampusAI, a friendly and helpful assistant for college students. " +
        "Help them with questions about attendance, timetables, syllabus, exams, faculty, " +
        "notices, events, career advice and general study help. Keep answers concise, " +
        "practical, and formatted in markdown when useful.",
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [systemPrompt, ...data.messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error: ${res.status} ${text}`);
    }
    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? "Sorry, I couldn't answer that.";
    return { content };
  });
