import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notices")({
  head: () => ({ meta: [{ title: "Manage Notices — Admin" }, { name: "description", content: "Publish and remove notices." }] }),
  component: NoticesAdmin,
});

type Row = { id: string; title: string; description: string; category: string; posted_on: string; attachments: number };
const CATS = ["Academic", "Events", "Placement", "Examination"];

function NoticesAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("notices").select("*").order("posted_on", { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this notice?")) return;
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
          <p className="text-muted-foreground">{rows.length} published</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="text-white" style={{ background: "var(--gradient-brand)" }}>
          <Plus className="mr-2 h-4 w-4" /> New notice
        </Button>
      </div>

      <div className="space-y-3">
        {loading && <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>}
        {rows.map(r => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{r.category}</Badge>
                  <span className="text-xs text-muted-foreground">{r.posted_on}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {!loading && rows.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">No notices yet — publish your first one.</Card>
        )}
      </div>

      <NoticeDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={load} />
    </div>
  );
}

function NoticeDialog({ open, onOpenChange, editing, onSaved }: any) {
  const [form, setForm] = useState<any>({ title: "", description: "", category: "Academic", posted_on: new Date().toISOString().slice(0, 10), attachments: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ title: "", description: "", category: "Academic", posted_on: new Date().toISOString().slice(0, 10), attachments: 0 });
  }, [editing, open]);

  async function save() {
    setSaving(true);
    const { error } = editing
      ? await supabase.from("notices").update(form).eq("id", editing.id)
      : await supabase.from("notices").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved"); onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit notice" : "New notice"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Date"><Input type="date" value={form.posted_on} onChange={(e) => setForm({ ...form, posted_on: e.target.value })} /></Field>
          </div>
          <Field label="Attachments (count)"><Input type="number" min={0} value={form.attachments} onChange={(e) => setForm({ ...form, attachments: Number(e.target.value) })} /></Field>
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
