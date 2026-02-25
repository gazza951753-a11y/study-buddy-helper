import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Eye, EyeOff, ArrowLeft, BookOpen, PenLine } from "lucide-react";
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

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "author">("student");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    telegram_username: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/dashboard");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      if (isLogin) {
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

        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Неверный email или пароль");
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        toast.success("Успешный вход!");
        navigate("/dashboard");
      } else {
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

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
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

        toast.success("Регистрация успешна!");
        navigate("/dashboard");
      }
    } catch {
      toast.error("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </button>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              Edu<span className="text-primary">Help</span>
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                isLogin
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                !isLogin
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection — only on registration */}
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
                    <span className="text-xs text-center leading-tight opacity-70">
                      Заказываю работы
                    </span>
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
                    <span className="text-xs text-center leading-tight opacity-70">
                      Выполняю работы
                    </span>
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
                {errors.username && (
                  <p className="text-destructive text-sm mt-1">{errors.username}</p>
                )}
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
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Пароль *</Label>
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
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
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

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={loading}
            >
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
