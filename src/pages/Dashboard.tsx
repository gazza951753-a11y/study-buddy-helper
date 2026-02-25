import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dashboard — роутер по роли.
 * После загрузки профиля перенаправляет:
 *   student → /student-dashboard
 *   author  → /author-dashboard
 */
const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!profile) {
        navigate("/auth");
        return;
      }

      if (profile.role === "author") {
        navigate("/author-dashboard", { replace: true });
      } else {
        navigate("/student-dashboard", { replace: true });
      }
    };

    redirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Загрузка...</div>
    </div>
  );
};

export default Dashboard;
