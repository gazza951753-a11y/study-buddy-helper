"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap,
  Eye,
  EyeOff,
  ArrowLeft,
  BookOpen,
  PenLine,
  Mail,
  RefreshCw,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import UserAgreementDialog from "@/components/UserAgreementDialog";

const signupSchema = z.object({
  username: z.string().min(3, "Логин должен быть минимум 3 символа").max(50),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен быть минимум 6 символов"),
  phone: z.string().optional(),
  telegram_username: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type Mode = "login" | "signup" | "forgot" | "forgot-sent";

const Auth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "author">("student");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    telegram_username: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const emailNotConfirmed = searchParams.get("emailNotConfirmed");
    const emailParam = searchParams.get("email");
    if (emailNotConfirmed && emailParam) {
      setPendingEmail(emailParam);
      toast.error("Email не подтверждён. Проверьте почту и перейдите по ссылке из письма.");
      router.replace("/auth");
    }
  }, [searchParams, router]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.replace("/dashboard");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) router.replace("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (mode === "login") {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { data: loginData, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Неверный email или пароль");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Email не подтверждён. Проверьте почту.");
            setPendingEmail(formData.email);
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        if (!loginData.user?.email_confirmed_at) {
          await supabase.auth.signOut();
          toast.error("Email не подтверждён. Проверьте почту.");
          setPendingEmail(formData.email);
          setLoading(false);
          return;
        }

        toast.success("Успешный вход!");
        router.push("/dashboard");
      } else if (mode === "signup") {
        if (!agreementAccepted) {
          toast.error("Необходимо принять пользовательское соглашение");
          setLoading(false);
          return;
        }

        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { data: signUpData, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/email-confirmed`,
            data: {
              username: formData.username,
              phone: formData.phone || null,
              telegram_username: formData.telegram_username || null,
              role: selectedRole,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Этот email уже зарегистрирован");
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        if (signUpData.session) {
          toast.success("Регистрация успешна!");
          router.push("/dashboard");
        } else {
          setPendingEmail(formData.email);
        }
      }
    } catch {
      toast.error("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      toast.error("Введите корректный email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);
    if (error) {
      toast.error("Ошибка: " + error.message);
    } else {
      setMode("forgot-sent");
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResendLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: `${window.location.origin}/email-confirmed` },
    });
    setResendLoading(false);
    if (error) {
      toast.error("Не удалось отправить письмо: " + error.message);
    } else {
      toast.success("Письмо отправлено повторно. Проверьте почту.");
    }
  };

  // ── "Check your email" screen ──
  if (pendingEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-elegant border border-border/50 p-8 flex flex-col items-center text-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Study<span className="text-gradient">Assist</span></span>
            </div>

            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-foreground mb-2">Подтвердите email</h1>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Письмо с ссылкой для активации отправлено на{" "}
                <span className="font-semibold text-foreground">{pendingEmail}</span>.
                Перейдите по ссылке в письме, чтобы войти в кабинет.
              </p>
            </div>

            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`} />
                {resendLoading ? "Отправляем..." : "Отправить письмо повторно"}
              </button>
              <button
                type="button"
                onClick={() => setPendingEmail(null)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Вернуться к входу
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Forgot password sent ──
  if (mode === "forgot-sent") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-elegant border border-border/50 p-8 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground mb-2">Письмо отправлено!</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Проверьте почту <span className="font-semibold text-foreground">{forgotEmail}</span>{" "}
                и перейдите по ссылке для сброса пароля.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setMode("login"); setForgotEmail(""); }}
            >
              Вернуться к входу
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Forgot password form ──
  if (mode === "forgot") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setMode("login")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к входу
          </button>

          <div className="bg-card rounded-3xl shadow-elegant border border-border/50 p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Study<span className="text-gradient">Assist</span></span>
            </div>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Сброс пароля</h2>
              <p className="text-muted-foreground text-sm">
                Введите ваш email — мы отправим ссылку для создания нового пароля
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="forgot-email">Email *</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Отправляем..." : "Отправить ссылку"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Main login / signup form ──
  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </button>

        <div className="bg-card rounded-3xl shadow-elegant border border-border/50 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Study<span className="text-gradient">Assist</span></span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                !isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection */}
            {!isLogin && (
              <div>
                <Label className="mb-2 block">Я регистрируюсь как *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("student")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedRole === "student"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <BookOpen className="w-6 h-6" />
                    <span className="font-medium text-sm">Студент</span>
                    <span className="text-xs text-center leading-tight opacity-70">Заказываю работы</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("author")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedRole === "author"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <PenLine className="w-6 h-6" />
                    <span className="font-medium text-sm">Автор</span>
                    <span className="text-xs text-center leading-tight opacity-70">Выполняю работы</span>
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <Label htmlFor="username">Логин *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ваш логин"
                  className={errors.username ? "border-destructive" : ""}
                />
                {errors.username && <p className="text-destructive text-sm mt-1">{errors.username}</p>}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Пароль *</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setForgotEmail(formData.email); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Забыли пароль?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 6 символов"
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="phone">Телефон (необязательно)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <Label htmlFor="telegram_username">Telegram (необязательно)</Label>
                  <Input
                    id="telegram_username"
                    name="telegram_username"
                    value={formData.telegram_username}
                    onChange={handleChange}
                    placeholder="@username"
                  />
                </div>
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="agreement"
                    checked={agreementAccepted}
                    onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
                  />
                  <label htmlFor="agreement" className="text-sm text-muted-foreground leading-tight">
                    Я принимаю{" "}
                    <button
                      type="button"
                      onClick={() => setShowAgreement(true)}
                      className="text-primary hover:underline"
                    >
                      пользовательское соглашение
                    </button>{" "}
                    и соглашаюсь с обработкой персональных данных
                  </label>
                </div>
              </>
            )}

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
            </Button>
          </form>
        </div>
      </div>

      <UserAgreementDialog open={showAgreement} onOpenChange={setShowAgreement} />
    </div>
  );
};

export default Auth;
