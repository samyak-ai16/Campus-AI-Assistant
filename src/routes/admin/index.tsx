import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, MessageSquare, ClipboardCheck, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { SUBJECTS, MONTHLY_ATTENDANCE, getAttendanceSummary } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview — CampusAI" }, { name: "description", content: "Admin analytics and controls." }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const [counts, setCounts] = useState({ students: 0, conversations: 0, messages: 0, activeToday: 0 });

  useEffect(() => {
    (async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [{ count: students }, { count: conversations }, { count: messages }, { count: activeToday }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("chat_conversations").select("*", { count: "exact", head: true }),
        supabase.from("chat_messages").select("*", { count: "exact", head: true }),
        supabase.from("chat_messages").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      ]);
      setCounts({
        students: students ?? 0,
        conversations: conversations ?? 0,
        messages: messages ?? 0,
        activeToday: activeToday ?? 0,
      });
    })();
  }, []);

  const att = getAttendanceSummary();
  const subjectData = SUBJECTS.map(s => ({ name: s.code, percent: Math.round((s.attended / s.total) * 100) }));
  const riskData = [
    { name: "On track", value: SUBJECTS.filter(s => s.attended / s.total >= 0.75).length },
    { name: "At risk", value: SUBJECTS.filter(s => s.attended / s.total < 0.75).length },
  ];
  const COLORS = ["oklch(0.58 0.22 285)", "oklch(0.62 0.2 25)"];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Real-time analytics across the platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Total students" value={counts.students} accent="oklch(0.58 0.22 285)" />
        <Stat icon={MessageSquare} label="Chat messages" value={counts.messages} sub={`${counts.conversations} conversations`} accent="oklch(0.72 0.18 195)" />
        <Stat icon={TrendingUp} label="Active today" value={counts.activeToday} sub="Messages sent today" accent="oklch(0.66 0.2 340)" />
        <Stat icon={ClipboardCheck} label="Avg attendance" value={`${att.percent}%`} sub="Across sample cohort" accent="oklch(0.75 0.17 85)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Attendance trend</h2>
            <Badge variant="secondary">Last 6 months</Badge>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_ATTENDANCE}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis domain={[60, 100]} tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="percent" fill="oklch(0.58 0.22 285)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Subjects at risk</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label>
                  {riskData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Subject-wise attendance</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectData}>
              <XAxis dataKey="name" tickLine={false} className="text-xs" />
              <YAxis domain={[0, 100]} tickLine={false} className="text-xs" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="percent" fill="oklch(0.72 0.18 195)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Popular questions (sample)</h2>
        <div className="mt-4 space-y-2 text-sm">
          {[
            { q: "What's my attendance this week?", n: 128 },
            { q: "When is the next exam?", n: 96 },
            { q: "Explain normalization in DBMS", n: 82 },
            { q: "Show me today's timetable", n: 74 },
            { q: "Who teaches Operating Systems?", n: 51 },
          ].map((r) => (
            <div key={r.q} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span>{r.q}</span>
              <Badge variant="secondary">{r.n} asks</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, accent }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow" style={{ background: accent }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}
