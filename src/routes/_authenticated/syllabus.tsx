import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SUBJECTS } from "@/lib/mock-data";
import { BookOpen, Download, Eye, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/syllabus")({
  head: () => ({
    meta: [
      { title: "Syllabus — CampusAI" },
      { name: "description", content: "Access syllabus PDFs for all your subjects." },
    ],
  }),
  component: Syllabus,
});

function Syllabus() {
  const [q, setQ] = useState("");
  const filtered = SUBJECTS.filter(
    (s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Syllabus</h1>
          <p className="text-muted-foreground">Course outlines and syllabus PDFs for every subject.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subject" className="pl-9 w-72" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Card key={s.code} className="p-5">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{s.code}</Badge>
              <Badge variant="outline">{s.credits} credits</Badge>
            </div>
            <h3 className="mt-2 text-lg font-semibold">{s.name}</h3>
            <p className="text-sm text-muted-foreground">{s.faculty} · Semester {s.semester}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info("Syllabus PDF viewer — connect a document backend to load.")}>
                <Eye className="mr-1 h-3.5 w-3.5" /> View
              </Button>
              <Button size="sm" className="flex-1 text-white" style={{ background: "var(--gradient-brand)" }} onClick={() => toast.success("Download queued")}>
                <Download className="mr-1 h-3.5 w-3.5" /> PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
