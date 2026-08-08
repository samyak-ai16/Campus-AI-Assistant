import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/faculty")({
  head: () => ({ meta: [{ title: "Manage Faculty — Admin" }, { name: "description", content: "Add and remove faculty members." }] }),
  component: FacultyAdmin,
});

type Row = { id: string; name: string; department: string; designation: string; email: string; office: string; subjects: string[] };

function FacultyAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("faculty").select("*").order("name");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this faculty member?")) return;
    const { error } = await supabase.from("faculty").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty</h1>
          <p className="text-muted-foreground">{rows.length} members</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="text-white" style={{ background: "var(--gradient-brand)" }}>
          <Plus className="mr-2 h-4 w-4" /> Add faculty
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr><Th>Name</Th><Th>Department</Th><Th>Designation</Th><Th>Email</Th><Th>Office</Th><Th className="text-right">Actions</Th></tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t">
                    <Td className="font-medium">{r.name}</Td>
                    <Td>{r.department}</Td>
                    <Td className="text-muted-foreground">{r.designation}</Td>
                    <Td className="text-muted-foreground">{r.email}</Td>
                    <Td>{r.office}</Td>
                    <Td className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </Td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No faculty yet — click "Add faculty" to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <FacultyDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={load} />
    </div>
  );
}

function FacultyDialog({ open, onOpenChange, editing, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Row | null; onSaved: () => void }) {
  const [form, setForm] = useState<Omit<Row, "id"> & { id?: string }>({ name: "", department: "", designation: "", email: "", office: "", subjects: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ name: "", department: "Computer Science", designation: "Assistant Professor", email: "", office: "", subjects: [] });
  }, [editing, open]);

  async function save() {
    setSaving(true);
    const payload = { ...form, subjects: typeof (form.subjects as any) === "string" ? String(form.subjects).split(",").map(s => s.trim()) : form.subjects };
    const { error } = editing
      ? await supabase.from("faculty").update(payload).eq("id", editing.id)
      : await supabase.from("faculty").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Added");
    onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit faculty" : "Add faculty"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department"><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
            <Field label="Designation"><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Field>
          </div>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Office"><Input value={form.office} onChange={(e) => setForm({ ...form, office: e.target.value })} /></Field>
          <Field label="Subjects (comma separated)">
            <Input value={Array.isArray(form.subjects) ? form.subjects.join(", ") : (form.subjects as any)} onChange={(e) => setForm({ ...form, subjects: e.target.value.split(",").map(s => s.trim()) })} />
          </Field>
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
