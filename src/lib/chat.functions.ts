import { createServerFn } from "@tanstack/react-start";
import type { ChatMessage } from "./api-chat";

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: ChatMessage[] }) => data)
  .handler(async ({ data }) => {
    const { generateRAGChatResponse } = await import("./api-chat");
    const result = await generateRAGChatResponse(data.messages);
    return {
      content: result.content,
      sources: result.sources,
    };
  });