import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getAttendanceSummary } from "@/lib/mock-data";
import { toast } from "sonner";
import { Loader2, Camera, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CampusAI" },
      { name: "description", content: "Your student profile." },
    ],
  }),
  component: Profile,
});

type ProfileRow = {
  full_name: string | null;
  roll_number: string | null;
  department: string | null;
  semester: string | null;
  email: string | null;
  avatar_url: string | null;
};

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileRow>({
    full_name: "", roll_number: "", department: "Computer Science", semester: "5", email: "", avatar_url: null,
  });
  const att = getAttendanceSummary();

  async function refreshSignedUrl(path: string | null) {
    if (!path) { setAvatarSignedUrl(null); return; }
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
    setAvatarSignedUrl(data?.signedUrl ?? null);
  }

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getUser();
      const user = sess.user;
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      const next: ProfileRow = {
        full_name: data?.full_name ?? user.user_metadata?.full_name ?? "",
        roll_number: data?.roll_number ?? user.user_metadata?.roll_number ?? "",
        department: data?.department ?? user.user_metadata?.department ?? "Computer Science",
        semester: data?.semester ?? user.user_metadata?.semester ?? "5",
        email: user.email ?? "",
        avatar_url: data?.avatar_url ?? null,
      };
      setProfile(next);
      await refreshSignedUrl(next.avatar_url);
      setLoading(false);
    })();
  }, []);

  async function save() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: profile.full_name ?? "",
      roll_number: profile.roll_number ?? "",
      department: profile.department ?? "",
      semester: profile.semester ?? "",
      avatar_url: profile.avatar_url,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  async function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please pick an image file"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    // remove previous
    if (profile.avatar_url && profile.avatar_url !== path) {
      await supabase.storage.from("avatars").remove([profile.avatar_url]);
    }
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", userId);
    if (dbErr) { toast.error(dbErr.message); setUploading(false); return; }
    setProfile((p) => ({ ...p, avatar_url: path }));
    await refreshSignedUrl(path);
    setUploading(false);
    toast.success("Avatar updated");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function removeAvatar() {
    if (!userId || !profile.avatar_url) return;
    setUploading(true);
    await supabase.storage.from("avatars").remove([profile.avatar_url]);
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    setProfile((p) => ({ ...p, avatar_url: null }));
    setAvatarSignedUrl(null);
    setUploading(false);
    toast.success("Avatar removed");
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const initials = (profile.full_name ?? "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your student details.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            {avatarSignedUrl ? (
              <img src={avatarSignedUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover shadow-lg" />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
                style={{ background: "var(--gradient-brand)" }}
              >
                {initials || "S"}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:scale-105 disabled:opacity-60"
              aria-label="Upload avatar"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold">{profile.full_name || "Student"}</div>
            <div className="text-sm text-muted-foreground">{profile.email}</div>
            <div className="text-xs text-muted-foreground">{profile.department} · Semester {profile.semester}</div>
            {profile.avatar_url && (
              <Button size="sm" variant="ghost" className="mt-2 h-7 px-2 text-destructive hover:text-destructive" onClick={removeAvatar} disabled={uploading}>
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove photo
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Full name</Label>
            <Input value={profile.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          </div>
          <div>
            <Label>Roll number</Label>
            <Input value={profile.roll_number ?? ""} onChange={(e) => setProfile({ ...profile, roll_number: e.target.value })} />
          </div>
          <div>
            <Label>Department</Label>
            <Select value={profile.department ?? ""} onValueChange={(v) => setProfile({ ...profile, department: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Computer Science","Information Technology","Electronics","Mechanical","Civil","Electrical"].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Semester</Label>
            <Select value={profile.semester ?? ""} onValueChange={(v) => setProfile({ ...profile, semester: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["1","2","3","4","5","6","7","8"].map((s) => <SelectItem key={s} value={s}>Semester {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Email</Label>
            <Input value={profile.email ?? ""} disabled />
          </div>
        </div>

        <Button onClick={save} disabled={saving} className="mt-6 text-white" style={{ background: "var(--gradient-brand)" }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Attendance summary</h2>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span>Overall</span>
            <span className="font-semibold">{att.percent}%</span>
          </div>
          <Progress value={att.percent} className="mt-2 h-2" />
          <div className="mt-1 text-xs text-muted-foreground">{att.attended} of {att.total} classes attended</div>
        </div>
      </Card>
    </div>
  );
}
