import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Search, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/academic-calendar")({
  head: () => ({
    meta: [
      { title: "Academic Calendar — CampusAI" },
      { name: "description", content: "Semester dates, holidays, and key academic events." },
    ],
  }),
  component: AcademicCalendarPage,
});

type Entry = {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string | null;
};

const CATEGORY_TONE: Record<string, string> = {
  Semester: "bg-primary/15 text-primary",
  Holiday: "bg-emerald-500/15 text-emerald-500",
  Exam: "bg-destructive/15 text-destructive",
  Registration: "bg-amber-500/15 text-amber-500",
  Break: "bg-sky-500/15 text-sky-500",
  Academic: "bg-violet-500/15 text-violet-500",
  Other: "bg-muted text-muted-foreground",
};

function AcademicCalendarPage() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("academic_calendar").select("*").order("start_date");
      setRows((data as Entry[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const filtered = useMemo(() =>
    rows.filter((r) =>
      !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.description.toLowerCase().includes(q.toLowerCase()) || r.category.toLowerCase().includes(q.toLowerCase())
    ), [rows, q]);

  const upcoming = filtered.filter((r) => (r.end_date ?? r.start_date) >= today);
  const past = filtered.filter((r) => (r.end_date ?? r.start_date) < today);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">Semester dates, holidays, and key academic events.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search entries" className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">The academic calendar hasn't been published yet.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          <Section title="Upcoming" items={upcoming} />
          {past.length > 0 && <Section title="Past" items={past} muted />}
        </div>
      )}
    </div>
  );
}

function Section({ title, items, muted }: { title: string; items: Entry[]; muted?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <div className="space-y-2">
        {items.map((e) => (
          <Card key={e.id} className={`flex items-start gap-4 p-4 ${muted ? "opacity-70" : ""}`}>
            <DateBlock start={e.start_date} end={e.end_date} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-medium">{e.title}</div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_TONE[e.category] ?? CATEGORY_TONE.Other}`}>{e.category}</span>
              </div>
              {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DateBlock({ start, end }: { start: string; end: string | null }) {
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const month = s.toLocaleString(undefined, { month: "short" });
  return (
    <div className="flex w-20 shrink-0 flex-col items-center rounded-lg border bg-muted/40 p-2 text-center">
      <div className="text-xs font-medium text-muted-foreground">{month}</div>
      <div className="text-xl font-bold leading-tight">{s.getDate()}</div>
      {e && (
        <div className="mt-1 text-[10px] text-muted-foreground">
          → {e.toLocaleString(undefined, { month: "short" })} {e.getDate()}
        </div>
      )}
    </div>
  );
}
