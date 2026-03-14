"use client";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Result = { email: string; status: "ok" | "error" | "pending"; message: string };

const ADMINS = [
  { email: "support@studyassist.ru", password: "rodopi91", username: "support" },
  { email: "prihodkods@mail.ru",     password: "rodopi92", username: "prihodkods" },
];

const SetupAdmins = () => {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  const run = async () => {
    setRunning(true);
    const out: Result[] = ADMINS.map(a => ({ email: a.email, status: "pending", message: "Обработка..." }));
    setResults([...out]);

    for (let i = 0; i < ADMINS.length; i++) {
      const { email, password, username } = ADMINS[i];

      // 1. Sign up
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`,
          data: { username, role: "student" },
        },
      });

      let userId = signupData?.user?.id;

      if (signupError) {
        // User might already exist — try sign-in to get userId
        if (signupError.message.includes("already") || signupError.message.includes("registered")) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (loginError || !loginData.user) {
            out[i] = { email, status: "error", message: "Не удалось войти: " + (loginError?.message || "нет userId") };
            setResults([...out]);
            continue;
          }
          userId = loginData.user.id;
          await supabase.auth.signOut();
        } else {
          out[i] = { email, status: "error", message: signupError.message };
          setResults([...out]);
          continue;
        }
      }

      if (!userId) {
        out[i] = { email, status: "error", message: "userId не получен" };
        setResults([...out]);
        continue;
      }

      // 2. Upsert profile with is_admin = true
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          { user_id: userId, email, username, role: "student", is_admin: true, bonus_balance: 0 },
          { onConflict: "user_id" }
        );

      if (profileError) {
        out[i] = { email, status: "error", message: "Профиль: " + profileError.message };
      } else {
        out[i] = { email, status: "ok", message: "Создан / обновлён успешно ✓" };
      }
      setResults([...out]);
    }

    setRunning(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-3xl shadow-elegant border border-border/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Первоначальная настройка</h1>
              <p className="text-sm text-muted-foreground">Создание учётных записей администраторов</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-2 text-sm">
            <p className="font-semibold text-foreground">Будут созданы аккаунты:</p>
            {ADMINS.map(a => (
              <div key={a.email} className="text-muted-foreground">
                • <span className="font-mono text-foreground">{a.email}</span> — роль: Администратор
              </div>
            ))}
          </div>

          {results.length > 0 && (
            <div className="space-y-3 mb-6">
              {results.map(r => (
                <div key={r.email} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  r.status === "ok" ? "bg-green-50/50 border-green-200" :
                  r.status === "error" ? "bg-red-50/50 border-red-200" :
                  "bg-muted/30 border-border"
                }`}>
                  {r.status === "pending" && <Loader2 className="w-4 h-4 mt-0.5 text-muted-foreground animate-spin shrink-0" />}
                  {r.status === "ok" && <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />}
                  {r.status === "error" && <XCircle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />}
                  <div>
                    <div className="font-medium text-sm text-foreground">{r.email}</div>
                    <div className="text-xs text-muted-foreground">{r.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!done ? (
            <Button
              variant="hero"
              className="w-full"
              disabled={running}
              onClick={run}
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Создаём аккаунты...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Создать администраторов
                </>
              )}
            </Button>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-success font-semibold">Готово! Аккаунты обработаны.</p>
              <p className="text-sm text-muted-foreground">
                Войдите в <a href="/auth" className="text-primary hover:underline">личный кабинет</a>{" "}
                с реквизитами администратора.
              </p>
              <p className="text-xs text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                ⚠️ Удалите или заблокируйте эту страницу после первой настройки.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupAdmins;
