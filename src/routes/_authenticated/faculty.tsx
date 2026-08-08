import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FACULTY } from "@/lib/mock-data";
import { Mail, MapPin, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty — CampusAI" },
      { name: "description", content: "Meet your professors and instructors." },
    ],
  }),
  component: FacultyPage,
});

function FacultyPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const departments = Array.from(new Set(FACULTY.map((f) => f.department)));

  const filtered = FACULTY.filter((f) => {
    if (dept !== "all" && f.department !== dept) return false;
    if (!q) return true;
    const term = q.toLowerCase();
    return f.name.toLowerCase().includes(term) || f.subjects.some((s) => s.toLowerCase().includes(term));
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty directory</h1>
          <p className="text-muted-foreground">Contact info and expertise for every professor.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or subject" className="pl-9 w-64" />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f) => (
          <Card key={f.email} className="p-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-white text-lg font-semibold shadow"
                style={{ background: "var(--gradient-brand)" }}
              >
                {f.initials}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.designation}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div><Badge variant="secondary">{f.department}</Badge></div>
              <div className="flex flex-wrap gap-1">
                {f.subjects.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
              </div>
              <div className="flex items-center gap-2 pt-1 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <a href={`mailto:${f.email}`} className="hover:text-foreground">{f.email}</a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {f.office}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
