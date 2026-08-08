import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { dayName } from "@/lib/mock-data";
import { Clock, MapPin, Printer, Search, Loader2, CalendarX } from "lucide-react";

export const Route = createFileRoute("/_authenticated/timetable")({
  head: () => ({
    meta: [
      { title: "Timetable — CampusAI" },
      { name: "description", content: "Your weekly class schedule." },
    ],
  }),
  component: Timetable,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Entry = {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
};

function Timetable() {
  const today = dayName(new Date());
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("timetable_entries")
        .select("*")
        .order("start_time");
      setRows((data as Entry[]) ?? []);
      setLoading(false);
    })();
  }, []);

  function isCurrent(start: string, end: string) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return today && nowMin >= sh * 60 + sm && nowMin < eh * 60 + em;
  }

  const byDay = (day: string) =>
    rows
      .filter((c) => c.day === day)
      .filter((c) => !q || c.subject.toLowerCase().includes(q.toLowerCase()) || c.faculty.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">Your class schedule for this semester.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subject or faculty" className="pl-9" />
          </div>
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarX className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No timetable has been published yet. Please check back once your admin uploads the class schedule.</p>
        </Card>
      ) : (
        <Tabs defaultValue="today">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Weekly view</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold">{today}</h2>
                <Badge variant="secondary">{byDay(today).length} classes</Badge>
              </div>
              <div className="space-y-2">
                {byDay(today).length === 0 && (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No classes scheduled for today.
                  </div>
                )}
                {byDay(today).map((c) => {
                  const current = isCurrent(c.start_time, c.end_time);
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center gap-4 rounded-lg border p-3 transition ${current ? "border-primary ring-2 ring-primary/30 bg-primary/5" : ""}`}
                    >
                      <div className="w-28 text-sm font-mono text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />{c.start_time}–{c.end_time}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{c.subject} {current && <Badge className="ml-2">Live now</Badge>}</div>
                        <div className="text-xs text-muted-foreground">{c.faculty}</div>
                      </div>
                      <div className="text-sm text-muted-foreground"><MapPin className="mr-1 inline h-3.5 w-3.5" />{c.room}</div>
                      {c.code && <Badge variant="outline">{c.code}</Badge>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="week" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {DAYS.map((day) => {
                const classes = byDay(day);
                return (
                  <Card key={day} className={`p-4 ${day === today ? "border-primary" : ""}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">{day}</h3>
                      <Badge variant="secondary">{classes.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {classes.length === 0 && <div className="text-xs text-muted-foreground">No classes</div>}
                      {classes.map((c) => (
                        <div key={c.id} className="rounded-md border p-2 text-sm">
                          <div className="font-mono text-xs text-muted-foreground">{c.start_time}–{c.end_time}</div>
                          <div className="font-medium">{c.subject}</div>
                          <div className="text-xs text-muted-foreground">{c.room}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
