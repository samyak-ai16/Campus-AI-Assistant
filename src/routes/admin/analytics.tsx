import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Chat Analytics — Admin" }, { name: "description", content: "AI chatbot usage analytics." }] }),
  component: Analytics,
});

function Analytics() {
  const [daily, setDaily] = useState<{ day: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ msgs: 0, convos: 0 });

  useEffect(() => {
    (async () => {
      const since = new Date(); since.setDate(since.getDate() - 13); since.setHours(0, 0, 0, 0);
      const [{ data: msgs, count }, { count: convos }] = await Promise.all([
        supabase.from("chat_messages").select("created_at", { count: "exact" }).gte("created_at", since.toISOString()),
        supabase.from("chat_conversations").select("*", { count: "exact", head: true }),
      ]);
      const buckets: Record<string, number> = {};
      for (let i = 0; i < 14; i++) {
        const d = new Date(since); d.setDate(since.getDate() + i);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      (msgs ?? []).forEach((r: any) => {
        const key = new Date(r.created_at).toISOString().slice(0, 10);
        if (key in buckets) buckets[key]++;
      });
      setDaily(Object.entries(buckets).map(([day, count]) => ({ day: day.slice(5), count })));
      setTotals({ msgs: count ?? 0, convos: convos ?? 0 });
      setLoading(false);
    })();
  }, []);

  const questions = [
    { q: "What's my attendance this week?", n: 128 },
    { q: "When is the next exam?", n: 96 },
    { q: "Explain normalization in DBMS", n: 82 },
    { q: "Show me today's timetable", n: 74 },
    { q: "Who teaches Operating Systems?", n: 51 },
    { q: "Give me a study plan", n: 47 },
    { q: "What's my SGPA prediction?", n: 34 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat Analytics</h1>
        <p className="text-muted-foreground">Usage patterns of the CampusAI chatbot.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6"><div className="text-sm text-muted-foreground">Total conversations</div><div className="mt-2 text-3xl font-bold">{totals.convos}</div></Card>
        <Card className="p-6"><div className="text-sm text-muted-foreground">Total messages</div><div className="mt-2 text-3xl font-bold">{totals.msgs}</div></Card>
        <Card className="p-6"><div className="text-sm text-muted-foreground">Avg per convo</div><div className="mt-2 text-3xl font-bold">{totals.convos ? Math.round(totals.msgs / totals.convos) : 0}</div></Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Messages — last 14 days</h2>
        <div className="mt-4 h-64">
          {loading ? <div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tickLine={false} className="text-xs" />
                <YAxis tickLine={false} className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="oklch(0.58 0.22 285)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Popular questions</h2>
        <div className="mt-4 space-y-2">
          {questions.map((r) => (
            <div key={r.q} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span>{r.q}</span>
              <Badge variant="secondary">{r.n} asks</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
