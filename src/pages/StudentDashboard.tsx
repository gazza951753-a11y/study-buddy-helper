import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  User,
  Settings,
  Package,
  Gift,
  Link2,
  LogOut,
  Edit2,
  Save,
  X,
  Plus,
  ExternalLink,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// ─── constants ────────────────────────────────────────────────────────────────

const WORK_TYPES = [
  { value: "essay", label: "Реферат", basePrice: 800 },
  { value: "coursework", label: "Курсовая работа", basePrice: 3500 },
  { value: "diploma", label: "Дипломная работа", basePrice: 15000 },
  { value: "control", label: "Контрольная работа", basePrice: 600 },
  { value: "practice", label: "Отчёт по практике", basePrice: 2000 },
  { value: "presentation", label: "Презентация", basePrice: 500 },
  { value: "test", label: "Тест/Экзамен", basePrice: 1000 },
];

const SUBJECTS = [
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

const DEADLINES = [
  { value: 1, label: "1 день", modifier: 2.0 },
  { value: 3, label: "3 дня", modifier: 1.5 },
  { value: 7, label: "1 неделя", modifier: 1.2 },
  { value: 14, label: "2 недели", modifier: 1.0 },
  { value: 30, label: "1 месяц", modifier: 0.9 },
];

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Ожидает оплаты",
  paid: "Оплачен",
  in_progress: "В работе",
  review: "На проверке",
  revision: "Доработка",
  completed: "Завершён",
  cancelled: "Отменён",
  disputed: "Спор",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-yellow-500/15 text-yellow-700 border-yellow-300",
  paid: "bg-blue-500/15 text-blue-700 border-blue-300",
  in_progress: "bg-purple-500/15 text-purple-700 border-purple-300",
  review: "bg-orange-500/15 text-orange-700 border-orange-300",
  revision: "bg-red-500/15 text-red-700 border-red-300",
  completed: "bg-green-500/15 text-green-700 border-green-300",
  cancelled: "bg-gray-500/15 text-gray-500 border-gray-300",
  disputed: "bg-red-500/15 text-red-800 border-red-400",
};

// ─── types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  phone: string | null;
  telegram_username: string | null;
  role: string;
  bonus_balance: number;
  referral_code: string | null;
  created_at: string;
}

interface Order {
  id: string;
  work_type: string;
  subject: string;
  deadline_days: number;
  title: string | null;
  price: number;
  status: string;
  created_at: string;
  author?: { username: string } | null;
}

// ─── component ────────────────────────────────────────────────────────────────

const StudentDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ username: "", phone: "", telegram_username: "" });

  // New order form
  const [orderForm, setOrderForm] = useState({
    workType: "",
    subject: "",
    deadlineDays: 0,
    title: "",
    description: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);

  const price = useMemo(() => {
    if (!orderForm.workType || !orderForm.subject || !orderForm.deadlineDays) return null;
    const work = WORK_TYPES.find(w => w.value === orderForm.workType);
    const subj = SUBJECTS.find(s => s.value === orderForm.subject);
    const dead = DEADLINES.find(d => d.value === orderForm.deadlineDays);
    if (!work || !subj || !dead) return null;
    return Math.round(work.basePrice * subj.modifier * dead.modifier);
  }, [orderForm]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/auth"); return; }

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!p) { router.push("/auth"); return; }
      if (p.role === "author") { router.push("/author-dashboard"); return; }

      setProfile(p as Profile);
      setEditData({ username: p.username, phone: p.phone || "", telegram_username: p.telegram_username || "" });
      await fetchOrders(p.id);
      setLoading(false);

      // Handle payment success redirect
      if (searchParams.get("payment") === "success") {
        const orderId = searchParams.get("order");
        if (orderId) {
          toast.success("Оплата прошла успешно! Заказ создан.");
          setActiveTab("orders");
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) router.push("/auth");
    });

    init();
    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  const fetchOrders = async (profileId: string) => {
    const { data } = await supabase
      .from("orders")
      .select(`*, author:profiles!orders_author_id_fkey(username)`)
      .eq("student_id", profileId)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as unknown as Order[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из системы");
    router.push("/");
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editData.username,
          phone: editData.phone || null,
          telegram_username: editData.telegram_username || null,
        })
        .eq("id", profile.id);
      if (error) throw error;
      setProfile({ ...profile, ...editData, phone: editData.phone || null, telegram_username: editData.telegram_username || null });
      setEditing(false);
      toast.success("Профиль обновлён");
    } catch {
      toast.error("Ошибка при сохранении");
    }
  };

  // Create order + pay
  const handleCreateOrder = async () => {
    if (!price || !profile) {
      toast.error("Заполните все поля");
      return;
    }
    setIsProcessing(true);
    try {
      // Create order in DB
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + orderForm.deadlineDays);

      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          student_id: profile.id,
          work_type: orderForm.workType,
          subject: orderForm.subject,
          deadline_days: orderForm.deadlineDays,
          title: orderForm.title || null,
          description: orderForm.description || null,
          price,
          status: "pending_payment",
        })
        .select()
        .single();

      if (orderError || !newOrder) throw new Error("Не удалось создать заказ");

      const workLabel = WORK_TYPES.find(w => w.value === orderForm.workType)?.label || orderForm.workType;
      const subjLabel = SUBJECTS.find(s => s.value === orderForm.subject)?.label || orderForm.subject;
      const payDesc = orderForm.title
        ? `${workLabel} — ${orderForm.title}`.substring(0, 128)
        : `${workLabel} — ${subjLabel}`.substring(0, 128);

      const returnUrl = `${window.location.origin}/student-dashboard?payment=success&order=${newOrder.id}`;

      const { data, error: fnError } = await supabase.functions.invoke("yookassa-payment", {
        body: {
          amount: price,
          description: payDesc,
          orderId: newOrder.id,
          customerEmail: profile.email,
          returnUrl,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        throw new Error("Не удалось получить ссылку для оплаты");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка при создании заказа";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const menuItems = [
    { id: "orders", label: "Мои заказы", icon: Package },
    { id: "new-order", label: "Новый заказ", icon: Plus },
    { id: "bonuses", label: "Бонусы", icon: Gift },
    { id: "referral", label: "Реферальная ссылка", icon: Link2 },
    { id: "profile", label: "Профиль", icon: User },
    { id: "settings", label: "Настройки", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">
                Edu<span className="text-primary">Help</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden sm:flex">Студент</Badge>
              <span className="text-sm text-muted-foreground hidden md:block">{profile?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Bonus card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-border p-4 mb-3">
              <p className="text-xs text-muted-foreground mb-1">Бонусный счёт</p>
              <p className="text-2xl font-bold text-foreground">{profile?.bonus_balance?.toLocaleString() ?? 0} ₽</p>
            </div>
            <nav className="bg-card rounded-xl border border-border p-2 sticky top-24">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1">
            <div className="bg-card rounded-xl border border-border p-6 lg:p-8">

              {/* ── ORDERS ── */}
              {activeTab === "orders" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Мои заказы</h1>
                    <Button onClick={() => setActiveTab("new-order")} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Новый заказ
                    </Button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <Package className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                      <p className="text-muted-foreground mb-4">У вас пока нет заказов</p>
                      <Button onClick={() => setActiveTab("new-order")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Создать первый заказ
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-border rounded-xl p-4 hover:border-primary/40 transition-colors cursor-pointer"
                          onClick={() => router.push(`/order?id=${order.id}`)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium truncate">
                                  {order.title || WORK_TYPES.find(w => w.value === order.work_type)?.label || order.work_type}
                                </p>
                                <Badge className={`border text-xs ${STATUS_COLORS[order.status] || ""}`}>
                                  {STATUS_LABELS[order.status] || order.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                                <span>{SUBJECTS.find(s => s.value === order.subject)?.label || order.subject}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {order.deadline_days} дн.
                                </span>
                                {(order.author as any)?.username && (
                                  <span>Автор: {(order.author as any).username}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-primary">{order.price.toLocaleString()} ₽</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(order.created_at).toLocaleDateString("ru-RU")}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end mt-2">
                            <span className="text-xs text-primary flex items-center gap-1 hover:underline">
                              Открыть <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── NEW ORDER ── */}
              {activeTab === "new-order" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Новый заказ</h1>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="space-y-5">
                      <div>
                        <Label>Тип работы *</Label>
                        <Select value={orderForm.workType} onValueChange={v => setOrderForm(f => ({ ...f, workType: v }))}>
                          <SelectTrigger className="mt-1 h-11">
                            <SelectValue placeholder="Выберите тип работы" />
                          </SelectTrigger>
                          <SelectContent>
                            {WORK_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Предмет *</Label>
                        <Select value={orderForm.subject} onValueChange={v => setOrderForm(f => ({ ...f, subject: v }))}>
                          <SelectTrigger className="mt-1 h-11">
                            <SelectValue placeholder="Выберите предмет" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map(s => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Срок выполнения *</Label>
                        <Select
                          value={orderForm.deadlineDays ? String(orderForm.deadlineDays) : ""}
                          onValueChange={v => setOrderForm(f => ({ ...f, deadlineDays: Number(v) }))}
                        >
                          <SelectTrigger className="mt-1 h-11">
                            <SelectValue placeholder="Выберите срок" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEADLINES.map(d => (
                              <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Тема работы</Label>
                        <Input
                          className="mt-1"
                          placeholder="Введите тему (необязательно)"
                          value={orderForm.title}
                          onChange={e => setOrderForm(f => ({ ...f, title: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>Дополнительные требования</Label>
                        <Textarea
                          className="mt-1"
                          placeholder="Опишите требования к работе (необязательно)"
                          rows={4}
                          value={orderForm.description}
                          onChange={e => setOrderForm(f => ({ ...f, description: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Payment summary */}
                    <div className="space-y-4">
                      <div className="bg-secondary/50 rounded-xl p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          Итого к оплате
                        </h3>
                        {price ? (
                          <p className="text-4xl font-bold text-primary">{price.toLocaleString()} ₽</p>
                        ) : (
                          <p className="text-muted-foreground">Заполните параметры</p>
                        )}
                        {orderForm.workType && orderForm.subject && orderForm.deadlineDays && (
                          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                            <p>{WORK_TYPES.find(w => w.value === orderForm.workType)?.label}</p>
                            <p>{SUBJECTS.find(s => s.value === orderForm.subject)?.label}</p>
                            <p>{DEADLINES.find(d => d.value === orderForm.deadlineDays)?.label}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        variant="hero"
                        size="lg"
                        onClick={handleCreateOrder}
                        disabled={!price || isProcessing}
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-5 h-5 animate-spin mr-2" />Обработка...</>
                        ) : (
                          <><CreditCard className="w-5 h-5 mr-2" />Оплатить {price ? `${price.toLocaleString()} ₽` : ""}</>
                        )}
                      </Button>

                      <div className="bg-card rounded-xl border border-border p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Гарантии</span>
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>Безопасная оплата через ЮKassa</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>Возврат при несоответствии</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>Чат с автором в режиме реального времени</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── BONUSES ── */}
              {activeTab === "bonuses" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Бонусы и скидки</h1>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-4">
                      <Gift className="w-12 h-12 text-primary" />
                      <div>
                        <p className="text-3xl font-bold">{profile?.bonus_balance?.toLocaleString() ?? 0} ₽</p>
                        <p className="text-muted-foreground">Накопленные бонусы</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>Бонусы начисляются за каждый оплаченный и завершённый заказ — <strong>5% от суммы</strong>.</p>
                    <p>Бонусами можно оплатить до <strong>30%</strong> стоимости следующего заказа.</p>
                    <p>Приглашайте друзей по реферальной ссылке и получайте <strong>10%</strong> от суммы их первого заказа.</p>
                  </div>
                </div>
              )}

              {/* ── REFERRAL ── */}
              {activeTab === "referral" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Реферальная программа</h1>
                  <div className="bg-secondary rounded-xl p-6 mb-6">
                    <Label>Ваша реферальная ссылка</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/?ref=${profile?.referral_code || ""}`}
                        className="bg-background"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?ref=${profile?.referral_code || ""}`);
                          toast.success("Ссылка скопирована!");
                        }}
                      >
                        Копировать
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Приглашайте друзей и получайте <strong>10%</strong> от суммы их первого заказа на бонусный счёт!
                  </p>
                </div>
              )}

              {/* ── PROFILE ── */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Мой профиль</h1>
                    {!editing ? (
                      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Редактировать
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Отмена
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile}>
                          <Save className="w-4 h-4 mr-2" />
                          Сохранить
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{profile?.username}</h2>
                        <p className="text-muted-foreground">{profile?.email}</p>
                        <Badge variant="secondary" className="mt-1">Студент</Badge>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Логин</Label>
                        {editing ? (
                          <Input value={editData.username} onChange={e => setEditData({ ...editData, username: e.target.value })} className="mt-1" />
                        ) : (
                          <p className="mt-1">{profile?.username}</p>
                        )}
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="mt-1 text-foreground">{profile?.email}</p>
                      </div>
                      <div>
                        <Label>Телефон</Label>
                        {editing ? (
                          <Input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} placeholder="Не указан" className="mt-1" />
                        ) : (
                          <p className="mt-1">{profile?.phone || <span className="text-muted-foreground">Не указан</span>}</p>
                        )}
                      </div>
                      <div>
                        <Label>Telegram</Label>
                        {editing ? (
                          <Input value={editData.telegram_username} onChange={e => setEditData({ ...editData, telegram_username: e.target.value })} placeholder="Не указан" className="mt-1" />
                        ) : (
                          <p className="mt-1">{profile?.telegram_username || <span className="text-muted-foreground">Не указан</span>}</p>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border text-sm text-muted-foreground">
                      Зарегистрирован: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ru-RU") : "—"}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SETTINGS ── */}
              {activeTab === "settings" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Настройки</h1>
                  <div className="space-y-6">
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-2">Сменить пароль</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Мы отправим ссылку для смены пароля на ваш email
                      </p>
                      <Button variant="outline" onClick={async () => {
                        if (profile?.email) {
                          await supabase.auth.resetPasswordForEmail(profile.email, {
                            redirectTo: `${window.location.origin}/auth`,
                          });
                          toast.success("Ссылка для сброса пароля отправлена на email");
                        }
                      }}>
                        Отправить ссылку
                      </Button>
                    </div>
                    <div className="p-4 border border-destructive/50 rounded-lg">
                      <h3 className="font-medium text-destructive mb-2">Удалить аккаунт</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Это действие нельзя отменить. Все данные будут удалены.
                      </p>
                      <Button variant="destructive" disabled>
                        Удалить аккаунт
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
