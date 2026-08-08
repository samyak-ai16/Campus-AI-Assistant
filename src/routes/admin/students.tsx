import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Manage Students — Admin" }, { name: "description", content: "Manage students in the CampusAI platform." }] }),
  component: Students,
});

type Row = { id: string; full_name: string; email: string; roll_number: string; department: string; semester: string; created_at: string };

function Students() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter(r => {
    if (!q) return true;
    const term = q.toLowerCase();
    return r.full_name?.toLowerCase().includes(term) || r.email?.toLowerCase().includes(term) || r.roll_number?.toLowerCase().includes(term);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">{rows.length} registered students</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, roll" className="pl-9 w-72" />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <Th>Name</Th><Th>Roll</Th><Th>Email</Th><Th>Department</Th><Th>Semester</Th><Th>Joined</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-t">
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-semibold" style={{ background: "var(--gradient-brand)" }}>
                          {(r.full_name || "?").split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        {r.full_name || <span className="text-muted-foreground italic">Unnamed</span>}
                      </div>
                    </Td>
                    <Td><Badge variant="outline">{r.roll_number || "—"}</Badge></Td>
                    <Td className="text-muted-foreground">{r.email}</Td>
                    <Td>{r.department || "—"}</Td>
                    <Td>{r.semester ? `Sem ${r.semester}` : "—"}</Td>
                    <Td className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</Td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

const Th = ({ children }: { children: any }) => <th className="px-4 py-3 text-left font-medium text-muted-foreground">{children}</th>;
const Td = ({ children, className = "" }: any) => <td className={`px-4 py-3 ${className}`}>{children}</td>;
