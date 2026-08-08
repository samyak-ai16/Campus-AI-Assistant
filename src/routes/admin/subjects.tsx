import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Pencil, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/subjects")({
  head: () => ({ meta: [{ title: "Manage Subjects — Admin" }, { name: "description", content: "Manage subjects and syllabus links." }] }),
  component: SubjectsAdmin,
});

type Row = { id: string; code: string; name: string; faculty: string; credits: number; semester: string; syllabus_url: string | null };

function SubjectsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("subjects").select("*").order("semester").order("code");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this subject?")) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">{rows.length} subjects · syllabus PDFs linked</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="text-white" style={{ background: "var(--gradient-brand)" }}>
          <Plus className="mr-2 h-4 w-4" /> Add subject
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr><Th>Code</Th><Th>Name</Th><Th>Faculty</Th><Th>Credits</Th><Th>Semester</Th><Th>Syllabus</Th><Th className="text-right">Actions</Th></tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t">
                    <Td><Badge variant="outline">{r.code}</Badge></Td>
                    <Td className="font-medium">{r.name}</Td>
                    <Td className="text-muted-foreground">{r.faculty}</Td>
                    <Td>{r.credits}</Td>
                    <Td>Sem {r.semester}</Td>
                    <Td>
                      {r.syllabus_url ? (
                        <a href={r.syllabus_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : <span className="text-muted-foreground">—</span>}
                    </Td>
                    <Td className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </Td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No subjects yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <SubjectDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={load} />
    </div>
  );
}

function SubjectDialog({ open, onOpenChange, editing, onSaved }: any) {
  const [form, setForm] = useState<any>({ code: "", name: "", faculty: "", credits: 3, semester: "1", syllabus_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm({ ...editing, syllabus_url: editing.syllabus_url ?? "" });
    else setForm({ code: "", name: "", faculty: "", credits: 3, semester: "1", syllabus_url: "" });
  }, [editing, open]);

  async function save() {
    setSaving(true);
    const payload = { ...form, credits: Number(form.credits), syllabus_url: form.syllabus_url || null };
    const { error } = editing
      ? await supabase.from("subjects").update(payload).eq("id", editing.id)
      : await supabase.from("subjects").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit subject" : "Add subject"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
            <Field label="Credits"><Input type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} /></Field>
          </div>
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Faculty"><Input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} /></Field>
            <Field label="Semester"><Input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></Field>
          </div>
          <Field label="Syllabus PDF URL"><Input placeholder="https://…/syllabus.pdf" value={form.syllabus_url} onChange={(e) => setForm({ ...form, syllabus_url: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="text-white" style={{ background: "var(--gradient-brand)" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Field = ({ label, children }: any) => <div><Label>{label}</Label>{children}</div>;
const Th = ({ children, className = "" }: any) => <th className={`px-4 py-3 text-left font-medium text-muted-foreground ${className}`}>{children}</th>;
const Td = ({ children, className = "" }: any) => <td className={`px-4 py-3 ${className}`}>{children}</td>;
