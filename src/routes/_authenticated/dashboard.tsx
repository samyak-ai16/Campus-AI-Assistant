import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Calendar, ClipboardCheck, MessageSquare, Bell, GraduationCap,
  TrendingUp, ArrowRight,
} from "lucide-react";
import {
  SUBJECTS, TIMETABLE, NOTICES, EXAMS, WEEKLY_ACTIVITY, getAttendanceSummary, dayName,
} from "@/lib/mock-data";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CampusAI" },
      { name: "description", content: "Your academic overview at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const att = getAttendanceSummary();
  const today = dayName(new Date());
  const todayClasses = TIMETABLE[today] ?? [];
  const upcomingExam = EXAMS[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>
        <p className="text-muted-foreground">Here's what's happening in your academic life today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${att.percent}%`} sub={`${att.attended}/${att.total} classes`} accent="oklch(0.72 0.18 195)" />
        <StatCard icon={BookOpen} label="Subjects" value={String(SUBJECTS.length)} sub="This semester" accent="oklch(0.58 0.22 285)" />
        <StatCard icon={GraduationCap} label="Upcoming exams" value={String(EXAMS.length)} sub={`Next: ${upcomingExam?.date ?? "—"}`} accent="oklch(0.66 0.2 340)" />
        <StatCard icon={Bell} label="Active notices" value={String(NOTICES.length)} sub="Last 30 days" accent="oklch(0.75 0.17 85)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Today's classes</h2>
              <p className="text-sm text-muted-foreground">{today}</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/timetable">View timetable <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {todayClasses.length === 0 && (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                No classes scheduled today — enjoy the break! 🎉
              </div>
            )}
            {todayClasses.map((c) => (
              <div key={c.code + c.start} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="text-sm font-mono text-muted-foreground w-24">{c.start} – {c.end}</div>
                <div className="flex-1">
                  <div className="font-medium">{c.subject}</div>
                  <div className="text-xs text-muted-foreground">{c.faculty} · {c.room}</div>
                </div>
                <Badge variant="secondary">{c.code}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ask CampusAI</h2>
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Get instant answers about your studies, schedule and college life.
          </p>
          <Button asChild className="mt-4 w-full text-white" style={{ background: "var(--gradient-brand)" }}>
            <Link to="/chat">Open AI Chat</Link>
          </Button>
          <div className="mt-4 space-y-2 text-sm">
            {["What's my attendance in OS?", "When is my next exam?", "Explain deadlocks briefly"].map((q) => (
              <div key={q} className="rounded-md bg-muted/60 px-3 py-2 text-muted-foreground">
                "{q}"
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Weekly study activity</h2>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_ACTIVITY}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="hours" fill="oklch(0.58 0.22 285)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Attendance by subject</h2>
            <Button variant="ghost" size="sm" asChild><Link to="/attendance">Details</Link></Button>
          </div>
          <div className="mt-4 space-y-3">
            {SUBJECTS.slice(0, 5).map((s) => {
              const pct = Math.round((s.attended / s.total) * 100);
              return (
                <div key={s.code}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className={pct < 75 ? "text-destructive" : "text-muted-foreground"}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-1.5 h-2" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent notices</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/notices">See all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {NOTICES.slice(0, 4).map((n) => (
            <div key={n.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{n.category}</Badge>
                <span className="text-xs text-muted-foreground">{n.date}</span>
              </div>
              <div className="mt-2 font-medium">{n.title}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub: string; accent: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow"
          style={{ background: accent }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </Card>
  );
}
