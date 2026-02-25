import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap,
  User,
  Settings,
  Package,
  LogOut,
  Edit2,
  Save,
  X,
  ExternalLink,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
  PlayCircle,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// ─── constants ────────────────────────────────────────────────────────────────

const WORK_LABELS: Record<string, string> = {
  essay: "Реферат",
  coursework: "Курсовая работа",
  diploma: "Дипломная работа",
  control: "Контрольная работа",
  practice: "Отчёт по практике",
  presentation: "Презентация",
  test: "Тест/Экзамен",
};

const SUBJECT_LABELS: Record<string, string> = {
  law: "Юриспруденция",
  economics: "Экономика",
  management: "Менеджмент",
  psychology: "Психология",
  pedagogy: "Педагогика",
  marketing: "Маркетинг",
  it: "Информатика/IT",
  medicine: "Медицина",
  history: "История",
  other: "Другое",
};

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
  bio: string | null;
  specializations: string[] | null;
  created_at: string;
}

interface Order {
  id: string;
  student_id: string;
  author_id: string | null;
  work_type: string;
  subject: string;
  deadline_days: number;
  title: string | null;
  description: string | null;
  price: number;
  status: string;
  created_at: string;
  deadline_date: string | null;
  student_rating: number | null;
  student?: { username: string } | null;
}

interface Stats {
  total_orders: number;
  completed_orders: number;
  total_earned: number;
  avg_rating: number | null;
}

// ─── component ────────────────────────────────────────────────────────────────

const AuthorDashboard = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total_orders: 0, completed_orders: 0, total_earned: 0, avg_rating: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    phone: "",
    telegram_username: "",
    bio: "",
    specializations: "",
  });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth"); return; }

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!p) { navigate("/auth"); return; }
      if (p.role === "student") { navigate("/student-dashboard"); return; }

      setProfile(p as Profile);
      setEditData({
        username: p.username,
        phone: p.phone || "",
        telegram_username: p.telegram_username || "",
        bio: p.bio || "",
        specializations: (p.specializations || []).join(", "),
      });

      await Promise.all([
        fetchAvailableOrders(),
        fetchMyOrders(p.id),
        fetchStats(p.id),
      ]);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) navigate("/auth");
    });

    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAvailableOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`*, student:profiles!orders_student_id_fkey(username)`)
      .eq("status", "paid")
      .is("author_id", null)
      .order("created_at", { ascending: false });
    if (data) setAvailableOrders(data as unknown as Order[]);
  };

  const fetchMyOrders = async (profileId: string) => {
    const { data } = await supabase
      .from("orders")
      .select(`*, student:profiles!orders_student_id_fkey(username)`)
      .eq("author_id", profileId)
      .order("created_at", { ascending: false });
    if (data) setMyOrders(data as unknown as Order[]);
  };

  const fetchStats = async (profileId: string) => {
    const { data } = await supabase.rpc("get_author_stats", { p_author_id: profileId });
    if (data && data.length > 0) {
      setStats(data[0] as Stats);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из системы");
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      const specializations = editData.specializations
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("profiles")
        .update({
          username: editData.username,
          phone: editData.phone || null,
          telegram_username: editData.telegram_username || null,
          bio: editData.bio || null,
          specializations: specializations.length ? specializations : null,
        })
        .eq("id", profile.id);

      if (error) throw error;
      setProfile({
        ...profile,
        username: editData.username,
        phone: editData.phone || null,
        telegram_username: editData.telegram_username || null,
        bio: editData.bio || null,
        specializations: specializations.length ? specializations : null,
      });
      setEditing(false);
      toast.success("Профиль обновлён");
    } catch {
      toast.error("Ошибка при сохранении");
    }
  };

  const menuItems = [
    { id: "available", label: "Доступные заказы", icon: BookOpen },
    { id: "my-orders", label: "Мои заказы", icon: Package },
    { id: "stats", label: "Статистика", icon: TrendingUp },
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

  const activeMyOrders = myOrders.filter(o => ["in_progress", "review", "revision"].includes(o.status));
  const completedMyOrders = myOrders.filter(o => o.status === "completed");

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
              <Badge className="hidden sm:flex bg-amber-500/20 text-amber-700 border-amber-300 border">Автор</Badge>
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
            {/* Stats mini-card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl border border-border p-4 mb-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Активных</span>
                <span className="font-bold text-foreground">{activeMyOrders.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Выполнено</span>
                <span className="font-bold text-foreground">{stats.completed_orders}</span>
              </div>
              {stats.avg_rating && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Рейтинг</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {stats.avg_rating}
                  </span>
                </div>
              )}
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
                  {item.id === "available" && availableOrders.length > 0 && (
                    <span className="ml-auto bg-primary/20 text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {availableOrders.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1">
            <div className="bg-card rounded-xl border border-border p-6 lg:p-8">

              {/* ── AVAILABLE ORDERS ── */}
              {activeTab === "available" && (
                <div>
                  <h1 className="text-2xl font-bold mb-2">Доступные заказы</h1>
                  <p className="text-muted-foreground text-sm mb-6">
                    Оплаченные заказы, ожидающие исполнителя. Откройте заказ и нажмите «Принять».
                  </p>

                  {availableOrders.length === 0 ? (
                    <div className="text-center py-16">
                      <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                      <p className="text-muted-foreground">Нет доступных заказов</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">Новые заказы появятся здесь автоматически</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableOrders.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-border rounded-xl p-4 hover:border-primary/40 transition-colors cursor-pointer"
                          onClick={() => navigate(`/order/${order.id}`)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {order.title || WORK_LABELS[order.work_type] || order.work_type}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                                <span>{WORK_LABELS[order.work_type] || order.work_type}</span>
                                <span>{SUBJECT_LABELS[order.subject] || order.subject}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {order.deadline_days} дн.
                                </span>
                              </div>
                              {order.description && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{order.description}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-primary text-lg">{order.price.toLocaleString()} ₽</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(order.created_at).toLocaleDateString("ru-RU")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                              Студент: {(order.student as any)?.username || "—"}
                            </span>
                            <span className="text-xs text-primary flex items-center gap-1 hover:underline">
                              <PlayCircle className="w-3 h-3" />
                              Принять заказ
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── MY ORDERS ── */}
              {activeTab === "my-orders" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Мои заказы</h1>

                  {myOrders.length === 0 ? (
                    <div className="text-center py-16">
                      <Package className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                      <p className="text-muted-foreground">Вы ещё не взяли ни одного заказа</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">Перейдите в «Доступные заказы»</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab("available")}>
                        Смотреть доступные заказы
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Active */}
                      {activeMyOrders.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            В работе ({activeMyOrders.length})
                          </h2>
                          <div className="space-y-3">
                            {activeMyOrders.map(order => (
                              <OrderCard key={order.id} order={order} onClick={() => navigate(`/order/${order.id}`)} />
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Completed */}
                      {completedMyOrders.length > 0 && (
                        <div>
                          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Завершённые ({completedMyOrders.length})
                          </h2>
                          <div className="space-y-3">
                            {completedMyOrders.map(order => (
                              <OrderCard key={order.id} order={order} onClick={() => navigate(`/order/${order.id}`)} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── STATS ── */}
              {activeTab === "stats" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Статистика</h1>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Всего заказов" value={String(stats.total_orders)} icon={Package} />
                    <StatCard label="Выполнено" value={String(stats.completed_orders)} icon={CheckCircle} color="text-green-600" />
                    <StatCard
                      label="Заработано"
                      value={`${stats.total_earned.toLocaleString()} ₽`}
                      icon={TrendingUp}
                      color="text-blue-600"
                    />
                    <StatCard
                      label="Рейтинг"
                      value={stats.avg_rating ? `${stats.avg_rating} ★` : "—"}
                      icon={Star}
                      color="text-yellow-500"
                    />
                  </div>

                  {myOrders.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Завершите первый заказ, чтобы увидеть детальную статистику.</p>
                  ) : (
                    <div>
                      <h2 className="text-base font-semibold mb-3">Последние заказы</h2>
                      <div className="space-y-2">
                        {myOrders.slice(0, 5).map(order => (
                          <div key={order.id} className="flex items-center justify-between text-sm p-3 border border-border rounded-lg">
                            <div>
                              <span className="font-medium">{order.title || WORK_LABELS[order.work_type]}</span>
                              <span className="text-muted-foreground ml-2">— {SUBJECT_LABELS[order.subject]}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {order.student_rating && (
                                <span className="flex items-center gap-1 text-yellow-600">
                                  <Star className="w-3 h-3 fill-current" />
                                  {order.student_rating}
                                </span>
                              )}
                              <span className="font-bold text-primary">{order.price.toLocaleString()} ₽</span>
                              <Badge className={`border text-xs ${STATUS_COLORS[order.status] || ""}`}>
                                {STATUS_LABELS[order.status]}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{profile?.username}</h2>
                        <p className="text-muted-foreground">{profile?.email}</p>
                        <Badge className="mt-1 bg-amber-500/20 text-amber-700 border-amber-300 border">Автор</Badge>
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

                    {/* Bio */}
                    <div>
                      <Label>О себе</Label>
                      {editing ? (
                        <Textarea
                          value={editData.bio}
                          onChange={e => setEditData({ ...editData, bio: e.target.value })}
                          placeholder="Расскажите о своём опыте и специализации"
                          rows={4}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm">{profile?.bio || <span className="text-muted-foreground">Не заполнено</span>}</p>
                      )}
                    </div>

                    {/* Specializations */}
                    <div>
                      <Label>Специализации</Label>
                      {editing ? (
                        <>
                          <Input
                            value={editData.specializations}
                            onChange={e => setEditData({ ...editData, specializations: e.target.value })}
                            placeholder="Юриспруденция, Экономика, IT (через запятую)"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Укажите предметы через запятую</p>
                        </>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(profile?.specializations || []).length > 0 ? (
                            (profile?.specializations || []).map(s => (
                              <Badge key={s} variant="secondary">{s}</Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">Не указаны</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {stats.avg_rating && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-medium mb-2">Рейтинг</p>
                        <div className="flex gap-1 items-center">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-5 h-5 ${s <= Math.round(stats.avg_rating!) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-bold">{stats.avg_rating}</span>
                          <span className="text-sm text-muted-foreground">({stats.completed_orders} отзывов)</span>
                        </div>
                      </div>
                    )}

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
                      <Button variant="destructive" disabled>Удалить аккаунт</Button>
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

// ─── sub-components ───────────────────────────────────────────────────────────

const OrderCard = ({ order, onClick }: { order: Order; onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="border border-border rounded-xl p-4 hover:border-primary/40 transition-colors cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">
            {order.title || WORK_LABELS[order.work_type] || order.work_type}
          </p>
          <Badge className={`border text-xs ${STATUS_COLORS[order.status] || ""}`}>
            {STATUS_LABELS[order.status] || order.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
          <span>{SUBJECT_LABELS[order.subject] || order.subject}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {order.deadline_days} дн.
          </span>
          {order.deadline_date && (
            <span>до {new Date(order.deadline_date).toLocaleDateString("ru-RU")}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-primary">{order.price.toLocaleString()} ₽</p>
        {order.student_rating && (
          <div className="flex items-center gap-1 justify-end mt-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium">{order.student_rating}</span>
          </div>
        )}
      </div>
    </div>
    <div className="flex justify-end mt-2">
      <span className="text-xs text-primary flex items-center gap-1">
        Открыть <ExternalLink className="w-3 h-3" />
      </span>
    </div>
  </motion.div>
);

const StatCard = ({
  label,
  value,
  icon: Icon,
  color = "text-foreground",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}) => (
  <div className="bg-secondary/50 rounded-xl p-4">
    <Icon className={`w-5 h-5 mb-2 ${color}`} />
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </div>
);

export default AuthorDashboard;
