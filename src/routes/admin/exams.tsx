import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/exams")({
  head: () => ({ meta: [{ title: "Manage Exams — Admin" }, { name: "description", content: "Schedule and remove exams." }] }),
  component: ExamsAdmin,
});

type Row = { id: string; subject: string; code: string; exam_date: string; exam_time: string; duration: string; room: string };

function ExamsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("exams").select("*").order("exam_date");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this exam?")) return;
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Exams</h1><p className="text-muted-foreground">{rows.length} scheduled</p></div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="text-white" style={{ background: "var(--gradient-brand)" }}>
          <Plus className="mr-2 h-4 w-4" /> Schedule exam
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr><Th>Subject</Th><Th>Code</Th><Th>Date</Th><Th>Time</Th><Th>Duration</Th><Th>Room</Th><Th className="text-right">Actions</Th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t">
                    <Td className="font-medium">{r.subject}</Td>
                    <Td><Badge variant="outline">{r.code}</Badge></Td>
                    <Td>{r.exam_date}</Td>
                    <Td>{r.exam_time}</Td>
                    <Td>{r.duration}</Td>
                    <Td>{r.room}</Td>
                    <Td className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </Td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No exams scheduled.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ExamDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={load} />
    </div>
  );
}

function ExamDialog({ open, onOpenChange, editing, onSaved }: any) {
  const [form, setForm] = useState<any>({ subject: "", code: "", exam_date: new Date().toISOString().slice(0, 10), exam_time: "10:00", duration: "3h", room: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ subject: "", code: "", exam_date: new Date().toISOString().slice(0, 10), exam_time: "10:00", duration: "3h", room: "" });
  }, [editing, open]);

  async function save() {
    setSaving(true);
    const { error } = editing
      ? await supabase.from("exams").update(form).eq("id", editing.id)
      : await supabase.from("exams").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved"); onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit exam" : "Schedule exam"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject"><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
            <Field label="Code"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Date"><Input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} /></Field>
            <Field label="Time"><Input type="time" value={form.exam_time} onChange={(e) => setForm({ ...form, exam_time: e.target.value })} /></Field>
            <Field label="Duration"><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
          </div>
          <Field label="Room"><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></Field>
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
