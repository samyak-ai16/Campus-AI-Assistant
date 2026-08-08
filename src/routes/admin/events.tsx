import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Pencil, Calendar, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Manage Events — Admin" }, { name: "description", content: "Add and remove campus events." }] }),
  component: EventsAdmin,
});

type Row = { id: string; title: string; description: string; event_date: string; event_time: string; venue: string };

function EventsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("event_date");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Events</h1><p className="text-muted-foreground">{rows.length} scheduled</p></div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="text-white" style={{ background: "var(--gradient-brand)" }}>
          <Plus className="mr-2 h-4 w-4" /> Add event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && <div className="col-span-full flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>}
        {rows.map(r => (
          <Card key={r.id} className="p-5">
            <h3 className="text-lg font-semibold">{r.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {r.event_date}</div>
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {r.event_time}</div>
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {r.venue}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
        {!loading && rows.length === 0 && <Card className="col-span-full p-10 text-center text-muted-foreground">No events yet.</Card>}
      </div>

      <EventDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={load} />
    </div>
  );
}

function EventDialog({ open, onOpenChange, editing, onSaved }: any) {
  const [form, setForm] = useState<any>({ title: "", description: "", event_date: new Date().toISOString().slice(0, 10), event_time: "09:00", venue: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ title: "", description: "", event_date: new Date().toISOString().slice(0, 10), event_time: "09:00", venue: "" });
  }, [editing, open]);

  async function save() {
    setSaving(true);
    const { error } = editing
      ? await supabase.from("events").update(form).eq("id", editing.id)
      : await supabase.from("events").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved"); onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit event" : "Add event"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></Field>
            <Field label="Time"><Input type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} /></Field>
          </div>
          <Field label="Venue"><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></Field>
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
