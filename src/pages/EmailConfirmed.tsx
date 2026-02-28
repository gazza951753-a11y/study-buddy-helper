import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmailConfirmed = () => {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Supabase processes the token from the URL automatically via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        // Sign out immediately — user should log in manually on the auth page
        supabase.auth.signOut().then(() => {
          setStatus("success");
        });
      }
    });

    // Fallback: if no event fires within 3s, still show success
    // (token may have already been processed)
    const fallback = setTimeout(() => {
      setStatus("success");
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  // Countdown redirect to /auth
  useEffect(() => {
    if (status !== "success") return;
    if (countdown === 0) {
      router.replace("/auth");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-10 flex flex-col items-center text-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Study<span className="text-primary">Assist</span>
            </span>
          </div>

          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Подтверждаем аккаунт…
                </h1>
                <p className="text-muted-foreground">
                  Пожалуйста, подождите несколько секунд
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Аккаунт активирован!
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  Ваш email успешно подтверждён. Теперь вы можете войти в личный кабинет.
                </p>
              </div>
              <div className="w-full space-y-3">
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => router.replace("/auth")}
                >
                  Войти в аккаунт
                </Button>
                <p className="text-sm text-muted-foreground">
                  Автоматический переход через{" "}
                  <span className="font-semibold text-primary">{countdown}</span> сек.
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Ссылка недействительна
                </h1>
                <p className="text-muted-foreground">
                  Ссылка устарела или уже была использована. Попробуйте зарегистрироваться заново.
                </p>
              </div>
              <Button
                variant="hero"
                className="w-full"
                onClick={() => router.replace("/auth")}
              >
                На страницу входа
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmed;
