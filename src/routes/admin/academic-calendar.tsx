import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Pencil, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/academic-calendar")({
  head: () => ({ meta: [{ title: "Academic Calendar — Admin" }, { name: "description", content: "Manage the academic calendar." }] }),
  component: AcademicCalendarAdmin,
});

const CATEGORIES = ["Semester", "Holiday", "Exam", "Registration", "Break", "Academic", "Other"];

type Row = {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string | null;
};

function AcademicCalendarAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("academic_calendar").select("*").order("start_date");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("academic_calendar").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">{rows.length} entries · semester dates, holidays, key academic events</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="text-white" style={{ background: "var(--gradient-brand)" }}>
          <Plus className="mr-2 h-4 w-4" /> Add entry
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <Th>Title</Th><Th>Category</Th><Th>Start</Th><Th>End</Th><Th>Description</Th><Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <Td className="font-medium">{r.title}</Td>
                    <Td><Badge variant="outline">{r.category}</Badge></Td>
                    <Td className="font-mono text-xs">{r.start_date}</Td>
                    <Td className="font-mono text-xs">{r.end_date ?? "—"}</Td>
                    <Td className="max-w-md truncate text-muted-foreground">{r.description}</Td>
                    <Td className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </Td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <CalendarDays className="mx-auto mb-2 h-6 w-6" />
                    No calendar entries yet.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <EntryDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={load} />
    </div>
  );
}

function EntryDialog({ open, onOpenChange, editing, onSaved }: any) {
  const [form, setForm] = useState<any>({ title: "", description: "", category: "Academic", start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm({ ...editing, end_date: editing.end_date ?? "" });
    else setForm({ title: "", description: "", category: "Academic", start_date: "", end_date: "" });
  }, [editing, open]);

  async function save() {
    if (!form.title || !form.start_date) return toast.error("Title and start date are required");
    setSaving(true);
    const payload = { ...form, end_date: form.end_date || null };
    const { error } = editing
      ? await supabase.from("academic_calendar").update(payload).eq("id", editing.id)
      : await supabase.from("academic_calendar").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit entry" : "Add entry"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
            <Field label="End date (optional)"><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>
          </div>
          <Field label="Description"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
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
