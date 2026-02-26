import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calculator, CreditCard, Shield, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const workTypes = [
  { value: "essay", label: "Реферат", basePrice: 800 },
  { value: "coursework", label: "Курсовая работа", basePrice: 3500 },
  { value: "diploma", label: "Дипломная работа", basePrice: 15000 },
  { value: "control", label: "Контрольная работа", basePrice: 600 },
  { value: "practice", label: "Отчёт по практике", basePrice: 2000 },
  { value: "presentation", label: "Презентация", basePrice: 500 },
  { value: "test", label: "Тест/Экзамен", basePrice: 1000 },
];

const subjects = [
  { value: "law", label: "Юриспруденция", modifier: 1.2 },
  { value: "economics", label: "Экономика", modifier: 1.1 },
  { value: "management", label: "Менеджмент", modifier: 1.0 },
  { value: "psychology", label: "Психология", modifier: 1.0 },
  { value: "pedagogy", label: "Педагогика", modifier: 0.95 },
  { value: "marketing", label: "Маркетинг", modifier: 1.1 },
  { value: "it", label: "Информатика/IT", modifier: 1.3 },
  { value: "medicine", label: "Медицина", modifier: 1.4 },
  { value: "history", label: "История", modifier: 0.9 },
  { value: "other", label: "Другое", modifier: 1.0 },
];

const deadlines = [
  { value: "1", label: "1 день", modifier: 2.0 },
  { value: "3", label: "3 дня", modifier: 1.5 },
  { value: "7", label: "1 неделя", modifier: 1.2 },
  { value: "14", label: "2 недели", modifier: 1.0 },
  { value: "30", label: "1 месяц", modifier: 0.9 },
];

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [workType, setWorkType] = useState(searchParams.get("type") || "");
  const [subject, setSubject] = useState(searchParams.get("subject") || "");
  const [deadline, setDeadline] = useState(searchParams.get("deadline") || "");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const price = useMemo(() => {
    if (!workType || !subject || !deadline) return null;

    const work = workTypes.find((w) => w.value === workType);
    const subj = subjects.find((s) => s.value === subject);
    const dead = deadlines.find((d) => d.value === deadline);

    if (!work || !subj || !dead) return null;

    return Math.round(work.basePrice * subj.modifier * dead.modifier);
  }, [workType, subject, deadline]);

  const handlePayment = async () => {
    if (!price || !email) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля и укажите email",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Try to get current user profile to create order in DB
      const { data: { session } } = await supabase.auth.getSession();
      let dbOrderId: string | null = null;

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profile) {
          const { data: newOrder } = await supabase
            .from("orders")
            .insert({
              student_id: profile.id,
              work_type: workType,
              subject: subject,
              deadline_days: Number(deadline),
              title: description || null,
              price,
              status: "pending_payment",
            })
            .select("id")
            .single();
          if (newOrder) dbOrderId = newOrder.id;
        }
      }

      const orderId = dbOrderId || `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const workLabel = workTypes.find(w => w.value === workType)?.label || workType;
      const subjectLabel = subjects.find(s => s.value === subject)?.label || subject;

      const paymentDescription = description
        ? `${workLabel} - ${subjectLabel}: ${description}`.substring(0, 128)
        : `${workLabel} - ${subjectLabel}`.substring(0, 128);

      const returnUrl = dbOrderId
        ? `${window.location.origin}/student-dashboard?payment=success&order=${dbOrderId}`
        : `${window.location.origin}/payment?status=success`;

      const { data, error } = await supabase.functions.invoke('yookassa-payment', {
        body: {
          amount: price,
          description: paymentDescription,
          orderId: orderId,
          customerEmail: email,
          returnUrl,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        throw new Error("Не удалось получить ссылку для оплаты");
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      const message = error instanceof Error ? error.message : "Произошла ошибка при создании платежа";
      toast({
        title: "Ошибка оплаты",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const status = searchParams.get("status");

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl shadow-elegant border border-border p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Оплата успешна!</h1>
          <p className="text-muted-foreground mb-6">
            Спасибо за заказ! Мы свяжемся с вами в ближайшее время для уточнения деталей.
          </p>
          <Button onClick={() => navigate("/")} variant="hero" className="w-full">
            Вернуться на главную
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Оплата заказа</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl shadow-elegant border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Параметры заказа</h2>
                <p className="text-sm text-muted-foreground">Выберите детали работы</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Тип работы *
                </label>
                <Select value={workType} onValueChange={setWorkType}>
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue placeholder="Выберите тип работы" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Предмет *
                </label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subj) => (
                      <SelectItem key={subj.value} value={subj.value}>
                        {subj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Срок выполнения *
                </label>
                <Select value={deadline} onValueChange={setDeadline}>
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue placeholder="Выберите срок" />
                  </SelectTrigger>
                  <SelectContent>
                    {deadlines.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Тема работы (необязательно)
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Введите тему или описание"
                  className="h-12"
                />
              </div>
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Price Card */}
            <div className="bg-card rounded-2xl shadow-elegant border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Оплата</h2>
                  <p className="text-sm text-muted-foreground">Предоплата за заказ</p>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Итого:</span>
                  {price ? (
                    <span className="text-3xl font-bold text-primary">
                      {price.toLocaleString()} ₽
                    </span>
                  ) : (
                    <span className="text-lg text-muted-foreground">Заполните параметры</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email для чека *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-12"
                  />
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handlePayment}
                  disabled={!price || !email || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Оплатить {price ? `${price.toLocaleString()} ₽` : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Безопасная оплата</span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>ЮKassa — лицензированный платёжный агрегатор</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>СБП, банковские карты, ЮMoney</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Электронный чек на email</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Гарантия возврата при несоответствии</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
