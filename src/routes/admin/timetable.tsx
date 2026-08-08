import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/timetable")({
  head: () => ({ meta: [{ title: "Manage Timetable — Admin" }, { name: "description", content: "Manage the weekly class timetable." }] }),
  component: TimetableAdmin,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Row = {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  semester: string;
};

function TimetableAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("timetable_entries").select("*").order("day").order("start_time");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this class?")) return;
    const { error } = await supabase.from("timetable_entries").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  const grouped = DAYS.map((d) => ({ day: d, items: rows.filter((r) => r.day === d) }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">{rows.length} classes across the week</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="text-white" style={{ background: "var(--gradient-brand)" }}>
          <Plus className="mr-2 h-4 w-4" /> Add class
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {grouped.map(({ day, items }) => (
            <Card key={day} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{day}</h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.length === 0 && <div className="text-xs text-muted-foreground">No classes</div>}
                {items.map((c) => (
                  <div key={c.id} className="rounded-md border p-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-muted-foreground">{c.start_time}–{c.end_time}</div>
                        <div className="font-medium truncate">{c.subject}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.faculty} · {c.room}</div>
                      </div>
                      <div className="flex shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <EntryDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={load} />
    </div>
  );
}

function EntryDialog({ open, onOpenChange, editing, onSaved }: any) {
  const [form, setForm] = useState<any>({ day: "Monday", start_time: "09:00", end_time: "10:00", subject: "", code: "", faculty: "", room: "", semester: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm({ ...editing });
    else setForm({ day: "Monday", start_time: "09:00", end_time: "10:00", subject: "", code: "", faculty: "", room: "", semester: "" });
  }, [editing, open]);

  async function save() {
    if (!form.subject) return toast.error("Subject is required");
    setSaving(true);
    const { error } = editing
      ? await supabase.from("timetable_entries").update(form).eq("id", editing.id)
      : await supabase.from("timetable_entries").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit class" : "Add class"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Day">
              <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Semester"><Input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start"><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></Field>
            <Field label="End"><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></Field>
          </div>
          <Field label="Subject"><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
            <Field label="Room"><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></Field>
          </div>
          <Field label="Faculty"><Input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} /></Field>
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
