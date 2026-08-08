import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Moon, Sun, Bell, Languages, Mic, Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CampusAI" },
      { name: "description", content: "Customize your CampusAI preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(false);
  const [language, setLanguage] = useState("en");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggleTheme(v: boolean) {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
  }

  async function changePassword() {
    if (newPw !== confirmPw) return toast.error("Passwords don't match");
    if (newPw.length < 6) return toast.error("Password must be at least 6 characters");
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSavingPw(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setNewPw(""); setConfirmPw("");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Personalize your CampusAI experience.</p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
        <Row icon={dark ? Moon : Sun} label="Dark mode" description="Switch between light and dark theme">
          <Switch checked={dark} onCheckedChange={toggleTheme} />
        </Row>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Preferences</h2>
        <Row icon={Bell} label="Notifications" description="Notices, exams, and event reminders">
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </Row>
        <Row icon={Mic} label="Voice input" description="Enable voice queries in AI Chat">
          <Switch checked={voice} onCheckedChange={setVoice} />
        </Row>
        <Row icon={Languages} label="Language" description="Choose your preferred language">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
              <SelectItem value="mr">मराठी (Marathi)</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Change password</h2>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <Label>New password</Label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          <Button onClick={changePassword} disabled={savingPw || !newPw} className="text-white" style={{ background: "var(--gradient-brand)" }}>
            Update password
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Row({ icon: Icon, label, description, children }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
