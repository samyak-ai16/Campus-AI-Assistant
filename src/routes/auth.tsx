import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — CampusAI" },
      { name: "description", content: "Log in or register to your CampusAI student account." },
      { property: "og:title", content: "Sign in — CampusAI" },
      { property: "og:description", content: "Access your CampusAI dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">CampusAI</span>
        </Link>
        <Card className="p-6 backdrop-blur bg-card/80">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm onForgot={() => setTab("forgot")} />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <RegisterForm onDone={() => setTab("login")} />
            </TabsContent>
            <TabsContent value="forgot" className="mt-6">
              <ForgotForm onBack={() => setTab("login")} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function LoginForm({ onForgot }: { onForgot: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="l-email">Email</Label>
        <Input id="l-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
      </div>
      <div>
        <Label htmlFor="l-pw">Password</Label>
        <Input id="l-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
          Remember me
        </label>
        <button type="button" onClick={onForgot} className="text-primary hover:underline">
          Forgot password?
        </button>
      </div>
      <Button type="submit" className="w-full text-white" style={{ background: "var(--gradient-brand)" }} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
      </Button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    roll_number: "",
    department: "Computer Science",
    semester: "5",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: form.full_name,
          roll_number: form.roll_number,
          department: form.department,
          semester: form.semester,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — please login.");
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label>Full name</Label>
        <Input required value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Ananya Verma" />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@college.edu" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Roll number</Label>
          <Input required value={form.roll_number} onChange={(e) => update("roll_number", e.target.value)} placeholder="CS2023045" />
        </div>
        <div>
          <Label>Semester</Label>
          <Select value={form.semester} onValueChange={(v) => update("semester", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["1","2","3","4","5","6","7","8"].map((s) => (
                <SelectItem key={s} value={s}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Department</Label>
        <Select value={form.department} onValueChange={(v) => update("department", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Computer Science","Information Technology","Electronics","Mechanical","Civil","Electrical"].map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Password</Label>
          <Input type="password" required value={form.password} onChange={(e) => update("password", e.target.value)} />
        </div>
        <div>
          <Label>Confirm</Label>
          <Input type="password" required value={form.confirm} onChange={(e) => update("confirm", e.target.value)} />
        </div>
      </div>
      <Button type="submit" className="w-full text-white" style={{ background: "var(--gradient-brand)" }} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </Button>
    </form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Reset link sent — check your email.");
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter your email and we'll send you a password reset link.
      </p>
      <div>
        <Label>Email</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
      </div>
      <Button type="submit" className="w-full text-white" style={{ background: "var(--gradient-brand)" }} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
      </Button>
      <button type="button" onClick={onBack} className="w-full text-sm text-muted-foreground hover:text-foreground">
        Back to login
      </button>
    </form>
  );
}
