import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EXAMS, RESULTS } from "@/lib/mock-data";
import { Calendar, Clock, MapPin, Download, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/exams")({
  head: () => ({
    meta: [
      { title: "Exams & Results — CampusAI" },
      { name: "description", content: "Exam schedule, results, and admit cards." },
    ],
  }),
  component: ExamsPage,
});

function ExamsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exams & Results</h1>
        <p className="text-muted-foreground">Track your schedule and past performance.</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="admit">Admit cards</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {EXAMS.map((e) => (
            <Card key={e.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{e.code}</Badge>
                    <Badge variant="outline">{e.duration}</Badge>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{e.subject}</h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {e.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.room}</span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => toast.success("Admit card downloaded")}>
                  <Download className="mr-2 h-4 w-4" /> Admit card
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="results" className="mt-4 space-y-4">
          {RESULTS.map((sem) => (
            <Card key={sem.semester} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{sem.semester}</h3>
                  <p className="text-sm text-muted-foreground">Final results</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <Trophy className="h-5 w-5 text-primary" /> {sem.sgpa}
                  </div>
                  <div className="text-xs text-muted-foreground">SGPA</div>
                </div>
              </div>
              <div className="mt-4 divide-y">
                {sem.results.map((r) => (
                  <div key={r.subject} className="flex items-center justify-between py-2">
                    <span className="text-sm">{r.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{r.marks} marks</span>
                      <Badge>{r.grade}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="admit" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Download admit cards</h3>
            <p className="text-sm text-muted-foreground">Available for all upcoming exams.</p>
            <div className="mt-4 space-y-2">
              {EXAMS.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{e.subject}</div>
                    <div className="text-xs text-muted-foreground">{e.code} · {e.date}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Downloaded")}>
                    <Download className="mr-1 h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
