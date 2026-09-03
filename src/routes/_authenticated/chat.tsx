import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User, Bot, Loader2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { chatCompletion } from "@/lib/chat.functions";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — CampusAI" },
      { name: "description", content: "Chat with CampusAI about your studies." },
    ],
  }),
  component: ChatPage,
});

type SourceDoc = {
  id?: string;
  title: string;
  content: string;
  category: string;
  similarity: number;
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  sources?: SourceDoc[];
};

const SUGGESTIONS = [
  "When are the upcoming MSE exams?",
  "What is the timetable for tomorrow?",
  "Who is the faculty for DBMS?",
  "Summarize the college attendance rules",
];

function ChatPage() {
  const send = useServerFn(chatCompletion);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm CampusAI, your college study and campus life companion. Ask me anything about your syllabus, timetable, exams, notices, or college rules.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submit(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await send({ data: { messages: next } });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.content,
          sources: res.sources as SourceDoc[] | undefined,
        },
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  const toggleSource = (index: number) => {
    setExpandedSources((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          CampusAI
        </h1>
        <p className="text-muted-foreground">Your intelligent study companion with verified campus knowledge</p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {m.role === "assistant" ? (
                  <div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>

                    {/* Sources Badge / Details */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-3 border-t border-border/40 pt-2 text-xs">
                        <button
                          onClick={() => toggleSource(i)}
                          className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>
                            {m.sources.length} Official Source{m.sources.length > 1 ? "s" : ""} Referenced
                          </span>
                          {expandedSources[i] ? (
                            <ChevronUp className="h-3 w-3 ml-0.5" />
                          ) : (
                            <ChevronDown className="h-3 w-3 ml-0.5" />
                          )}
                        </button>

                        {expandedSources[i] && (
                          <div className="mt-2 space-y-2 rounded-lg bg-background/70 p-2.5 text-muted-foreground">
                            {m.sources.map((src, srcIdx) => (
                              <div key={srcIdx} className="border-b border-border/30 pb-1.5 last:border-0 last:pb-0">
                                <div className="flex items-center justify-between font-semibold text-foreground">
                                  <span>{src.title}</span>
                                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                                    {Math.round((src.similarity || 0) * 100)}% match
                                  </span>
                                </div>
                                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed italic">
                                  "{src.content}"
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  m.content
                )}
              </div>
              {m.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="border-t bg-muted/30 px-6 py-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-full border bg-background px-3 py-1 text-xs hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          className="flex gap-2 border-t p-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask CampusAI anything..."
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
