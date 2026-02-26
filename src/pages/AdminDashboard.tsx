import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Users,
  ShoppingBag,
  BarChart3,
  FileText,
  LogOut,
  Trash2,
  Plus,
  Pencil,
  X,
  Check,
  Shield,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

type Profile = {
  id: string;
  user_id: string;
  username: string;
  email: string;
  phone: string | null;
  telegram_username: string | null;
  role: "student" | "author";
  is_admin: boolean;
  bonus_balance: number;
  created_at: string;
};

type OrderRow = {
  id: string;
  work_type: string;
  subject: string;
  price: number;
  status: string;
  created_at: string;
  student_id: string;
  author_id: string | null;
  student?: { username: string; email: string };
  author?: { username: string } | null;
};

type FaqItem = { question: string; answer: string };

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Ожидает оплаты",
  paid: "Оплачен",
  in_progress: "В работе",
  review: "На проверке",
  revision: "Доработка",
  completed: "Завершён",
  cancelled: "Отменён",
  disputed: "Спор",
};

const WORK_TYPE_LABELS: Record<string, string> = {
  essay: "Реферат",
  coursework: "Курсовая",
  diploma: "Дипломная",
  control: "Контрольная",
  practice: "Практика",
  presentation: "Презентация",
  test: "Тест",
};

const ACTIVE_STATUSES = ["paid", "in_progress", "review", "revision"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  // Users
  const [users, setUsers] = useState<Profile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    authors: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });

  // FAQ
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [editingFaqIdx, setEditingFaqIdx] = useState<number | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqItem>({ question: "", answer: "" });
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);

  // Auth + admin check
  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!profile || !profile.is_admin) {
        navigate("/dashboard");
        return;
      }

      setCurrentProfile(profile as Profile);
      setLoading(false);
    };
    check();
  }, [navigate]);

  // Load all data once auth is confirmed
  useEffect(() => {
    if (!loading) {
      loadUsers();
      loadOrders();
      loadFaq();
    }
  }, [loading]);

  // ---------- Loaders ----------

  const loadUsers = async () => {
    setUsersLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    const rows = (data || []) as Profile[];
    setUsers(rows);
    setStats((prev) => ({
      ...prev,
      totalUsers: rows.length,
      students: rows.filter((p) => p.role === "student").length,
      authors: rows.filter((p) => p.role === "author").length,
    }));
    setUsersLoading(false);
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!ordersData) {
      setOrdersLoading(false);
      return;
    }

    const profileIds = new Set<string>();
    ordersData.forEach((o) => {
      profileIds.add(o.student_id);
      if (o.author_id) profileIds.add(o.author_id);
    });

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, username, email")
      .in("id", Array.from(profileIds));

    const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

    const enriched: OrderRow[] = ordersData.map((o) => ({
      ...o,
      student: profileMap.get(o.student_id) as { username: string; email: string } | undefined,
      author: o.author_id
        ? (profileMap.get(o.author_id) as { username: string } | undefined)
        : null,
    }));

    setOrders(enriched);
    setStats((prev) => ({
      ...prev,
      totalOrders: ordersData.length,
      activeOrders: ordersData.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
      completedOrders: ordersData.filter((o) => o.status === "completed").length,
      totalRevenue: ordersData
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + o.price, 0),
    }));
    setOrdersLoading(false);
  };

  const loadFaq = async () => {
    setFaqLoading(true);
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "faq")
      .maybeSingle();
    if (data?.value) setFaqItems(data.value as FaqItem[]);
    setFaqLoading(false);
  };

  // ---------- Actions ----------

  const handleRoleChange = async (profileId: string, newRole: "student" | "author") => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profileId);
    if (error) { toast.error("Ошибка при смене роли"); return; }
    toast.success("Роль изменена");
    loadUsers();
  };

  const handleDeleteUser = async (profileId: string, username: string) => {
    if (!confirm(`Удалить пользователя «${username}»? Это действие нельзя отменить.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", profileId);
    if (error) { toast.error("Ошибка при удалении: " + error.message); return; }
    toast.success("Пользователь удалён");
    loadUsers();
  };

  const handleToggleAdmin = async (profileId: string, isAdmin: boolean, username: string) => {
    if (profileId === currentProfile?.id) {
      toast.error("Нельзя изменить права администратора у самого себя");
      return;
    }
    const action = isAdmin ? "снять права администратора у" : "назначить администратором";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} пользователя «${username}»?`)) return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !isAdmin })
      .eq("id", profileId);
    if (error) { toast.error("Ошибка: " + error.message); return; }
    toast.success(isAdmin ? "Права администратора сняты" : `«${username}» теперь администратор`);
    loadUsers();
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) { toast.error("Ошибка при смене статуса"); return; }
    toast.success("Статус обновлён");
    loadOrders();
  };

  const saveFaq = async (items: FaqItem[]) => {
    const { error } = await supabase.from("site_content").upsert({
      key: "faq",
      label: "Часто задаваемые вопросы",
      value: items as unknown as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) { toast.error("Ошибка сохранения FAQ"); return; }
    setFaqItems(items);
    toast.success("FAQ сохранён");
  };

  const handleSaveFaqItem = () => {
    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      toast.error("Заполните вопрос и ответ");
      return;
    }
    const updated = [...faqItems];
    if (editingFaqIdx !== null) {
      updated[editingFaqIdx] = editingFaq;
    } else {
      updated.push(editingFaq);
    }
    saveFaq(updated);
    setEditingFaqIdx(null);
    setIsAddingFaq(false);
    setEditingFaq({ question: "", answer: "" });
  };

  const handleDeleteFaqItem = (idx: number) => {
    if (!confirm("Удалить этот вопрос?")) return;
    saveFaq(faqItems.filter((_, i) => i !== idx));
  };

  const cancelFaqEdit = () => {
    setEditingFaqIdx(null);
    setIsAddingFaq(false);
    setEditingFaq({ question: "", answer: "" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

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
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">Панель администратора</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {currentProfile?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Заказы
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <FileText className="w-4 h-4" />
              Контент (FAQ)
            </TabsTrigger>
          </TabsList>

          {/* ── USERS ── */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Пользователи ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Имя</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Telegram</TableHead>
                          <TableHead>Роль</TableHead>
                          <TableHead>Бонусы</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.username}
                              {user.is_admin && (
                                <Badge variant="default" className="ml-2 text-xs">
                                  Админ
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone || "—"}</TableCell>
                            <TableCell>
                              {user.telegram_username ? `@${user.telegram_username}` : "—"}
                            </TableCell>
                            <TableCell>
                              {user.is_admin ? (
                                <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
                                  Администратор
                                </Badge>
                              ) : (
                                <Select
                                  value={user.role}
                                  onValueChange={(v) =>
                                    handleRoleChange(user.id, v as "student" | "author")
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="student">Студент</SelectItem>
                                    <SelectItem value="author">Автор</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell>{user.bonus_balance.toLocaleString("ru-RU")} ₽</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString("ru-RU")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {user.id !== currentProfile?.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title={user.is_admin ? "Снять права администратора" : "Назначить администратором"}
                                    className={user.is_admin ? "text-purple-600 hover:text-purple-700" : "text-muted-foreground hover:text-primary"}
                                    onClick={() => handleToggleAdmin(user.id, user.is_admin, user.username)}
                                  >
                                    {user.is_admin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                  </Button>
                                )}
                                {!user.is_admin && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ORDERS ── */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Заказы ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Тип</TableHead>
                          <TableHead>Предмет</TableHead>
                          <TableHead>Цена</TableHead>
                          <TableHead>Студент</TableHead>
                          <TableHead>Автор</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Дата</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {order.id.slice(0, 8)}…
                            </TableCell>
                            <TableCell>
                              {WORK_TYPE_LABELS[order.work_type] || order.work_type}
                            </TableCell>
                            <TableCell>{order.subject}</TableCell>
                            <TableCell className="font-medium">
                              {order.price.toLocaleString("ru-RU")} ₽
                            </TableCell>
                            <TableCell>
                              <div>{order.student?.username || "—"}</div>
                              <div className="text-xs text-muted-foreground">
                                {order.student?.email}
                              </div>
                            </TableCell>
                            <TableCell>{order.author?.username || "—"}</TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(v) => handleOrderStatusChange(order.id, v)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("ru-RU")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── STATS ── */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Всего пользователей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stats.students} студентов · {stats.authors} авторов
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Всего заказов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalOrders}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stats.activeOrders} активных
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Завершено заказов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.completedOrders}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stats.totalOrders > 0
                      ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                      : 0}
                    % от всех
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Выручка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalRevenue.toLocaleString("ru-RU")} ₽
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">по завершённым</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── CONTENT (FAQ) ── */}
          <TabsContent value="content">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>
                  FAQ{" "}
                  <span className="text-muted-foreground font-normal text-base">
                    ({faqItems.length} вопросов)
                  </span>
                </CardTitle>
                {!isAddingFaq && editingFaqIdx === null && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsAddingFaq(true);
                      setEditingFaq({ question: "", answer: "" });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {faqLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : (
                  <>
                    {/* New item form */}
                    {isAddingFaq && (
                      <FaqEditForm
                        value={editingFaq}
                        onChange={setEditingFaq}
                        onSave={handleSaveFaqItem}
                        onCancel={cancelFaqEdit}
                        title="Новый вопрос"
                      />
                    )}

                    {/* Existing FAQ items */}
                    {faqItems.map((item, idx) =>
                      editingFaqIdx === idx ? (
                        <FaqEditForm
                          key={idx}
                          value={editingFaq}
                          onChange={setEditingFaq}
                          onSave={handleSaveFaqItem}
                          onCancel={cancelFaqEdit}
                          title={`Редактировать вопрос #${idx + 1}`}
                        />
                      ) : (
                        <div
                          key={idx}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="font-medium text-sm flex-1">{item.question}</div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingFaqIdx(idx);
                                  setIsAddingFaq(false);
                                  setEditingFaq({ ...item });
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteFaqItem(idx)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">{item.answer}</div>
                        </div>
                      )
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ── Small sub-component for FAQ editing ──
const FaqEditForm = ({
  value,
  onChange,
  onSave,
  onCancel,
  title,
}: {
  value: FaqItem;
  onChange: (v: FaqItem) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
}) => (
  <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
    <div className="font-medium text-sm">{title}</div>
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">Вопрос</label>
      <Input
        value={value.question}
        onChange={(e) => onChange({ ...value, question: e.target.value })}
        placeholder="Введите вопрос..."
      />
    </div>
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">Ответ</label>
      <Textarea
        value={value.answer}
        onChange={(e) => onChange({ ...value, answer: e.target.value })}
        placeholder="Введите ответ..."
        rows={3}
      />
    </div>
    <div className="flex gap-2">
      <Button size="sm" onClick={onSave}>
        <Check className="w-4 h-4 mr-1" />
        Сохранить
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        <X className="w-4 h-4 mr-1" />
        Отмена
      </Button>
    </div>
  </div>
);

export default AdminDashboard;
