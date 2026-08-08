import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const [role, setRole] = useState<"admin" | "student" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { if (alive) { setRole(null); setLoading(false); } return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userRes.user.id);
      if (!alive) return;
      const roles = (data ?? []).map((r) => r.role);
      setRole(roles.includes("admin") ? "admin" : "student");
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return { role, loading, isAdmin: role === "admin" };
}
