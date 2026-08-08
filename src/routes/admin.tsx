import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, LayoutDashboard, Users, GraduationCap, BookOpen, Bell, PartyPopper, ClipboardList, MessageSquare, ArrowLeft, Loader2, Brain, Calendar, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/faculty", label: "Faculty", icon: GraduationCap },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { to: "/admin/timetable", label: "Timetable", icon: Calendar },
  { to: "/admin/notices", label: "Notices", icon: Bell },
  { to: "/admin/events", label: "Events", icon: PartyPopper },
  { to: "/admin/academic-calendar", label: "Academic Calendar", icon: CalendarDays },
  { to: "/admin/exams", label: "Exams", icon: ClipboardList },
  { to: "/admin/analytics", label: "Chat Analytics", icon: MessageSquare },
];

function AdminLayout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { navigate({ to: "/auth", replace: true }); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
      if (data) setStatus("ok");
      else setStatus("denied");
    })();
  }, [navigate]);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (status === "denied") {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <Shield className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">You don't have permission to view the admin panel. Contact your administrator to be granted access.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="outline"><Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard</Link></Button>
          <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); toast.success("Signed out"); navigate({ to: "/", replace: true }); }}>Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">CampusAI</div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2">
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to student app</Link>
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6">
        <Outlet />
      </main>
    </div>
  );
}
