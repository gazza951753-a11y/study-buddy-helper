import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  GraduationCap,
  Send,
  Star,
  CheckCircle,
  RefreshCw,
  PlayCircle,
  Upload,
  FileText,
  LogOut,
  Clock,
  User,
} from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  role: "student" | "author";
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
  student_review: string | null;
  student?: { username: string } | null;
  author?: { username: string } | null;
}

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: { username: string } | null;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

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
  pending_payment: "bg-yellow-500/15 text-yellow-600 border-yellow-300",
  paid: "bg-blue-500/15 text-blue-600 border-blue-300",
  in_progress: "bg-purple-500/15 text-purple-600 border-purple-300",
  review: "bg-orange-500/15 text-orange-600 border-orange-300",
  revision: "bg-red-500/15 text-red-600 border-red-300",
  completed: "bg-green-500/15 text-green-600 border-green-300",
  cancelled: "bg-gray-500/15 text-gray-500 border-gray-300",
  disputed: "bg-red-500/15 text-red-700 border-red-400",
};

// ─── component ────────────────────────────────────────────────────────────────

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── auth + load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth"); return; }

      const { data: p } = await supabase
        .from("profiles")
        .select("id, user_id, username, email, role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!p) { navigate("/dashboard"); return; }
      setProfile(p as Profile);

      await loadOrder();
      setLoading(false);
    };
    init();
  }, [id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`order-messages-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_messages", filter: `order_id=eq.${id}` },
        () => { loadMessages(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        student:profiles!orders_student_id_fkey(username),
        author:profiles!orders_author_id_fkey(username)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) { toast.error("Заказ не найден"); navigate("/dashboard"); return; }
    setOrder(data as unknown as Order);
    await loadMessages();
  };

  const loadMessages = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("order_messages")
      .select(`*, sender:profiles!order_messages_sender_id_fkey(username)`)
      .eq("order_id", id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as unknown as Message[]);
  };

  // ── actions ──────────────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile || !order) return;
    setSendingMessage(true);
    try {
      const { error } = await supabase.from("order_messages").insert({
        order_id: order.id,
        sender_id: profile.id,
        message: newMessage.trim(),
      });
      if (error) throw error;
      setNewMessage("");
    } catch {
      toast.error("Ошибка отправки сообщения");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const updateOrderStatus = async (newStatus: string, extra?: Record<string, unknown>) => {
    if (!order) return;
    setActionLoading(true);
    try {
      const updateData: Record<string, unknown> = { status: newStatus, ...extra };
      if (newStatus === "in_progress") {
        updateData.author_id = profile!.id;
        updateData.accepted_at = new Date().toISOString();
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + order.deadline_days);
        updateData.deadline_date = deadline.toISOString();
      }
      if (newStatus === "review") updateData.submitted_at = new Date().toISOString();
      if (newStatus === "completed") updateData.completed_at = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", order.id);

      if (error) throw error;
      await loadOrder();
      toast.success("Статус заказа обновлён");
    } catch {
      toast.error("Ошибка обновления статуса");
    } finally {
      setActionLoading(false);
    }
  };

  const submitRating = async () => {
    if (!rating) { toast.error("Поставьте оценку"); return; }
    await updateOrderStatus("completed", {
      student_rating: rating,
      student_review: review || null,
    });
    setShowRating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // ── render helpers ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!order || !profile) return null;

  const isStudent = profile.role === "student";
  const isAuthor = profile.role === "author";
  const isMyOrder =
    (isStudent && order.student_id === profile.id) ||
    (isAuthor && order.author_id === profile.id);
  const canChat = isMyOrder || (isAuthor && order.status === "paid");

  // ── action buttons based on role + status ─────────────────────────────────────
  const renderActions = () => {
    if (isAuthor) {
      if (order.status === "paid" && !order.author_id) {
        return (
          <Button
            onClick={() => updateOrderStatus("in_progress")}
            disabled={actionLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Принять заказ
          </Button>
        );
      }
      if (order.status === "in_progress" && order.author_id === profile.id) {
        return (
          <Button
            onClick={() => updateOrderStatus("review")}
            disabled={actionLoading}
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Сдать на проверку
          </Button>
        );
      }
      if (order.status === "revision" && order.author_id === profile.id) {
        return (
          <Button
            onClick={() => updateOrderStatus("review")}
            disabled={actionLoading}
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Повторно сдать
          </Button>
        );
      }
    }

    if (isStudent && order.student_id === profile.id) {
      if (order.status === "review") {
        return (
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setShowRating(true)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Принять работу
            </Button>
            <Button
              onClick={() => updateOrderStatus("revision")}
              disabled={actionLoading}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Запросить доработку
            </Button>
          </div>
        );
      }
    }

    return null;
  };

  // ── status steps ──────────────────────────────────────────────────────────────
  const steps = [
    { key: "paid", label: "Оплачен" },
    { key: "in_progress", label: "В работе" },
    { key: "review", label: "Проверка" },
    { key: "completed", label: "Завершён" },
  ];
  const stepOrder = ["pending_payment", "paid", "in_progress", "review", "revision", "completed"];
  const currentStepIndex = stepOrder.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <a href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground hidden sm:block">
                  Edu<span className="text-primary">Help</span>
                </span>
              </a>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT — order info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Card: info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-lg font-bold text-foreground leading-tight">
                  {order.title || `${WORK_LABELS[order.work_type] || order.work_type}`}
                </h1>
                <Badge className={`ml-2 shrink-0 border ${STATUS_COLORS[order.status] || ""}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Тип работы</span>
                  <span className="font-medium">{WORK_LABELS[order.work_type] || order.work_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Предмет</span>
                  <span className="font-medium">{SUBJECT_LABELS[order.subject] || order.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Срок</span>
                  <span className="font-medium">{order.deadline_days} дн.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Стоимость</span>
                  <span className="font-bold text-primary text-base">{order.price.toLocaleString()} ₽</span>
                </div>
                {order.deadline_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Дедлайн</span>
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.deadline_date).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Студент</span>
                  <span className="font-medium flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {(order.student as any)?.username || "—"}
                  </span>
                </div>
                {order.author_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Автор</span>
                    <span className="font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {(order.author as any)?.username || "—"}
                    </span>
                  </div>
                )}
              </div>

              {order.description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Описание</p>
                  <p className="text-sm">{order.description}</p>
                </div>
              )}
            </div>

            {/* Progress steps */}
            {!["pending_payment", "cancelled", "disputed"].includes(order.status) && (
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm font-medium text-foreground mb-4">Прогресс</p>
                <div className="space-y-3">
                  {steps.map((step) => {
                    const stepIdx = stepOrder.indexOf(step.key);
                    const done = currentStepIndex > stepIdx;
                    const current = currentStepIndex === stepIdx || (order.status === "revision" && step.key === "review");
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          done ? "bg-green-500" : current ? "bg-primary" : "bg-muted"
                        }`}>
                          {done ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <span className={`text-xs font-bold ${current ? "text-primary-foreground" : "text-muted-foreground"}`}>
                              {steps.indexOf(step) + 1}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm ${done || current ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            {renderActions() && (
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm font-medium text-foreground mb-3">Действия</p>
                {renderActions()}
              </div>
            )}

            {/* Rating (after completion) */}
            {order.status === "completed" && order.student_rating && (
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm font-medium text-foreground mb-2">Оценка студента</p>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${s <= order.student_rating! ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                {order.student_review && (
                  <p className="text-sm text-muted-foreground">{order.student_review}</p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — chat */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border flex flex-col h-[600px]">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Чат по заказу</h2>
                <p className="text-xs text-muted-foreground">
                  Обсуждайте детали с {isStudent ? "автором" : "студентом"}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Сообщений пока нет. Начните общение!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === profile.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary text-foreground rounded-bl-sm"
                        }`}>
                          {!isMine && (
                            <p className="text-xs font-semibold mb-1 opacity-70">
                              {(msg.sender as any)?.username || "—"}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {canChat ? (
                <div className="p-4 border-t border-border flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Написать сообщение... (Enter — отправить)"
                    disabled={sendingMessage}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
                  Чат доступен участникам заказа
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Оценить работу</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Поставьте оценку и оставьте отзыв об авторе
            </p>

            <div className="flex gap-2 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      s <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Оставьте отзыв (необязательно)"
              className="mb-4"
              rows={3}
            />

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRating(false)}>
                Отмена
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={submitRating}
                disabled={actionLoading || !rating}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Принять работу
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
