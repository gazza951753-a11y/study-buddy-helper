import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

/**
 * Dashboard — роутер по роли.
 * После загрузки профиля перенаправляет:
 *   student → /student-dashboard
 *   author  → /author-dashboard
 */
const Dashboard = () => {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const redirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/auth");
        return;
      }

      // Block access if email is not confirmed
      if (!session.user.email_confirmed_at) {
        await supabase.auth.signOut();
        router.push("/auth?emailNotConfirmed=1&email=" + encodeURIComponent(session.user.email || ""));
        return;
      }

      // Retry up to 5 times with 800ms delay — profile may not be created yet
      // immediately after signup (Supabase trigger runs asynchronously)
      let profile = null;
      let lastError = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error: queryError } = await supabase
          .from("profiles")
          .select("role, is_admin")
          .eq("user_id", session.user.id)
          .maybeSingle();
        lastError = queryError;
        if (data) { profile = data; break; }
        if (queryError) {
          console.error("Profile query error:", queryError);
        }
        await new Promise(r => setTimeout(r, 800));
      }

      if (!profile) {
        // Do NOT redirect to /auth here — that causes an infinite loop
        // when the user is authenticated but their profile is missing.
        // Instead, show an error with a sign-out button.
        console.error("Profile not found after retries. Last error:", lastError);
        setError(true);
        return;
      }

      if (profile.is_admin) {
        router.replace("/admin");
      } else if (profile.role === "author") {
        router.replace("/author-dashboard");
      } else {
        router.replace("/student-dashboard");
      }
    };

    redirect();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-muted-foreground text-sm">
            Профиль не найден. Возможно, база данных ещё не настроена.
            Применените миграции в Supabase SQL Editor и войдите снова.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth");
            }}
          >
            Выйти и войти снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Загрузка...</div>
    </div>
  );
};

export default Dashboard;
