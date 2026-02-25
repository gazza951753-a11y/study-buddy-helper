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

      // Retry up to 5 times with 800ms delay — profile may not be created yet
      // immediately after signup (Supabase trigger runs asynchronously)
      let profile = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data } = await supabase
          .from("profiles")
          .select("role, is_admin")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (data) { profile = data; break; }
        await new Promise(r => setTimeout(r, 800));
      }

      if (!profile) {
        navigate("/auth");
        return;
      }

      if (profile.is_admin) {
        navigate("/admin", { replace: true });
      } else if (profile.role === "author") {
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
