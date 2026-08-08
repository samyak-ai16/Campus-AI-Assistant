import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, MessageSquare, ClipboardCheck, Calendar, BookOpen,
  Users, Bell, PartyPopper, GraduationCap, User, Settings, LogOut, Brain, Loader2, Search, Shield, Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useI18n, type Lang } from "@/lib/i18n";
import { GlobalSearch } from "@/components/global-search";
import { NotificationCenter } from "@/components/notification-center";
import { useUserRole } from "@/hooks/use-user-role";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { t, lang, setLang } = useI18n();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) navigate({ to: "/auth", replace: true });
      else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/auth", replace: true });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              {t("search_placeholder")}
            </button>
            <div className="md:hidden flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Language"><Languages className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
                {(["en", "hi", "mr"] as Lang[]).map((l) => (
                  <DropdownMenuItem key={l} onClick={() => setLang(l)} className={lang === l ? "bg-muted" : ""}>
                    {l === "en" ? "English" : l === "hi" ? "हिंदी" : "मराठी"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <NotificationCenter />
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { t } = useI18n();
  const { isAdmin } = useUserRole();

  const NAV = [
    { title: t("dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("ai_chat"), url: "/chat", icon: MessageSquare },
    { title: t("attendance"), url: "/attendance", icon: ClipboardCheck },
    { title: t("timetable"), url: "/timetable", icon: Calendar },
    { title: t("syllabus"), url: "/syllabus", icon: BookOpen },
    { title: t("faculty"), url: "/faculty", icon: Users },
    { title: t("notices"), url: "/notices", icon: Bell },
    { title: t("events"), url: "/events", icon: PartyPopper },
    { title: "Academic Calendar", url: "/academic-calendar", icon: Calendar },
    { title: t("exams"), url: "/exams", icon: GraduationCap },
  ];
  const ACCOUNT = [
    { title: t("profile"), url: "/profile", icon: User },
    { title: t("settings"), url: "/settings", icon: Settings },
  ];

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/", replace: true });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-md"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Brain className="h-4 w-4" />
          </div>
          {!collapsed && <span className="text-base font-semibold tracking-tight">CampusAI</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ACCOUNT.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin")}>
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                      <span>{t("admin_panel")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start gap-2">
          <LogOut className="h-4 w-4" /> {!collapsed && t("sign_out")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
