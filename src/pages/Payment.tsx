"use client";
import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Calculator,
  CreditCard,
  Shield,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Paperclip,
  X,
  FileText,
  Image,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const workTypes = [
  { value: "essay",        label: "Реферат",             basePrice: 800   },
  { value: "coursework",   label: "Курсовая работа",     basePrice: 3500  },
  { value: "diploma",      label: "Дипломная работа",    basePrice: 15000 },
  { value: "control",      label: "Контрольная работа",  basePrice: 600   },
  { value: "practice",     label: "Отчёт по практике",   basePrice: 2000  },
  { value: "presentation", label: "Презентация",         basePrice: 500   },
  { value: "test",         label: "Тест/Экзамен",        basePrice: 1000  },
];

const subjects = [
  { value: "law",        label: "Юриспруденция",   modifier: 1.2 },
  { value: "economics",  label: "Экономика",        modifier: 1.1 },
  { value: "management", label: "Менеджмент",       modifier: 1.0 },
  { value: "psychology", label: "Психология",       modifier: 1.0 },
  { value: "pedagogy",   label: "Педагогика",       modifier: 0.95 },
  { value: "marketing",  label: "Маркетинг",        modifier: 1.1 },
  { value: "it",         label: "Информатика/IT",   modifier: 1.3 },
  { value: "medicine",   label: "Медицина",         modifier: 1.4 },
  { value: "history",    label: "История",          modifier: 0.9 },
  { value: "other",      label: "Другое",           modifier: 1.0 },
];

const deadlines = [
  { value: "1",  label: "1 день",    modifier: 2.0 },
  { value: "3",  label: "3 дня",     modifier: 1.5 },
  { value: "7",  label: "1 неделя",  modifier: 1.2 },
  { value: "14", label: "2 недели",  modifier: 1.0 },
  { value: "30", label: "1 месяц",   modifier: 0.9 },
];

const MAX_FILES = 10;
const MAX_SIZE_MB = 20;

type UploadedFile = {
  file: File;
  path: string;     // Storage path after upload
  url: string;      // Signed URL for Telegram
  uploading: boolean;
  error?: string;
};

function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) return <Image className="w-4 h-4 text-primary" />;
  return <FileText className="w-4 h-4 text-primary" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const Payment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [workType,    setWorkType]    = useState(searchParams.get("type")     || "");
  const [subject,     setSubject]     = useState(searchParams.get("subject")  || "");
  const [deadline,    setDeadline]    = useState(searchParams.get("deadline") || "");
  const [email,       setEmail]       = useState("");
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging,  setIsDragging]  = useState(false);

  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const price = useMemo(() => {
    if (!workType || !subject || !deadline) return null;
    const work = workTypes.find(w => w.value === workType);
    const subj = subjects.find(s => s.value === subject);
    const dead = deadlines.find(d => d.value === deadline);
    if (!work || !subj || !dead) return null;
    return Math.round(work.basePrice * subj.modifier * dead.modifier);
  }, [workType, subject, deadline]);

  // Upload a single file to Supabase Storage
  const uploadFile = useCallback(async (file: File): Promise<{ path: string; url: string } | null> => {
    const ext = file.name.split(".").pop() || "bin";
    const path = `orders/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("order-attachments")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }

    // Create a signed URL valid for 7 days (for Telegram)
    const { data: signedData } = await supabase.storage
      .from("order-attachments")
      .createSignedUrl(path, 7 * 24 * 3600);

    return { path, url: signedData?.signedUrl || "" };
  }, []);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);

    // Filter duplicates & cap total
    const existing = uploadedFiles.map(f => f.file.name + f.file.size);
    const fresh = arr.filter(f => !existing.includes(f.name + f.size));
    const allowed = fresh.slice(0, MAX_FILES - uploadedFiles.length);

    if (allowed.length === 0) return;

    // Validate sizes
    const oversized = allowed.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      toast({
        title: "Файл слишком большой",
        description: `Максимальный размер файла — ${MAX_SIZE_MB} МБ`,
        variant: "destructive",
      });
      return;
    }

    // Add placeholders
    const placeholders: UploadedFile[] = allowed.map(f => ({
      file: f, path: "", url: "", uploading: true,
    }));
    setUploadedFiles(prev => [...prev, ...placeholders]);

    // Upload in parallel
    const results = await Promise.all(
      allowed.map(f => uploadFile(f).catch(() => null)),
    );

    setUploadedFiles(prev => {
      const next = [...prev];
      const start = next.length - allowed.length;
      for (let i = 0; i < allowed.length; i++) {
        const res = results[i];
        if (res) {
          next[start + i] = { ...next[start + i], path: res.path, url: res.url, uploading: false };
        } else {
          next[start + i] = { ...next[start + i], uploading: false, error: "Ошибка загрузки" };
        }
      }
      return next;
    });
  }, [uploadedFiles, uploadFile, toast]);

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Drag-and-drop handlers
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handlePayment = async () => {
    if (!price || !email) {
      toast({ title: "Ошибка", description: "Заполните все поля и укажите email", variant: "destructive" });
      return;
    }
    if (uploadedFiles.some(f => f.uploading)) {
      toast({ title: "Подождите", description: "Файлы ещё загружаются", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      let dbOrderId: string | null = null;

      const successfulUrls = uploadedFiles.filter(f => !f.error && f.url).map(f => f.url);
      const successfulNames = uploadedFiles.filter(f => !f.error && f.url).map(f => f.file.name);

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
              subject,
              deadline_days: Number(deadline),
              title: description || null,
              price,
              status: "pending_payment",
              attachment_urls: successfulUrls,
            })
            .select("id")
            .single();
          if (newOrder) dbOrderId = newOrder.id;
        }
      }

      const orderId = dbOrderId || `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const workLabel    = workTypes.find(w => w.value === workType)?.label || workType;
      const subjectLabel = subjects.find(s => s.value === subject)?.label || subject;
      const deadlineLabel = deadlines.find(d => d.value === deadline)?.label || deadline;

      const paymentDescription = description
        ? `${workLabel} - ${subjectLabel}: ${description}`.substring(0, 128)
        : `${workLabel} - ${subjectLabel}`.substring(0, 128);

      // Notify Telegram bot (non-blocking)
      supabase.functions.invoke("send-telegram", {
        body: {
          name: "Клиент",
          contact: email,
          workType: workLabel,
          subject: subjectLabel,
          deadline: deadlineLabel,
          price: `${price.toLocaleString("ru-RU")} ₽`,
          message: description || undefined,
          attachmentUrls: successfulUrls.length > 0 ? successfulUrls : undefined,
          attachmentNames: successfulNames.length > 0 ? successfulNames : undefined,
        },
      }).catch(err => console.warn("Telegram notify failed (non-fatal):", err));

      const returnUrl = dbOrderId
        ? `${window.location.origin}/student-dashboard?payment=success&order=${dbOrderId}`
        : `${window.location.origin}/payment?status=success`;

      const { data, error } = await supabase.functions.invoke("yookassa-payment", {
        body: {
          amount: price,
          description: paymentDescription,
          orderId,
          customerEmail: email,
          returnUrl,
        },
      });

      if (error) throw new Error(error.message);

      if (data?.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        throw new Error("Не удалось получить ссылку для оплаты");
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      toast({
        title: "Ошибка оплаты",
        description: error instanceof Error ? error.message : "Произошла ошибка при создании платежа",
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
          className="bg-card rounded-3xl shadow-elegant border border-border/50 p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Оплата успешна!</h1>
          <p className="text-muted-foreground mb-6">
            Спасибо за заказ! Мы свяжемся с вами в ближайшее время для уточнения деталей.
          </p>
          <Button onClick={() => router.push("/")} variant="hero" className="w-full">
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
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Оформление заказа</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">

          {/* ── Left: Order parameters + file upload ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-2xl shadow-elegant border border-border/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Параметры заказа</h2>
                  <p className="text-xs text-muted-foreground">Выберите детали работы</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Тип работы *</label>
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Выберите тип работы" />
                    </SelectTrigger>
                    <SelectContent>
                      {workTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Предмет *</label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Выберите предмет" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Срок выполнения *</label>
                  <Select value={deadline} onValueChange={setDeadline}>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Выберите срок" />
                    </SelectTrigger>
                    <SelectContent>
                      {deadlines.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Тема / описание</label>
                  <Input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Введите тему или требования к работе"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* ── File Upload ── */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Paperclip className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Прикрепить файлы</h3>
                  <p className="text-xs text-muted-foreground">
                    Методичка, задание, пример работы — до {MAX_FILES} файлов, до {MAX_SIZE_MB} МБ каждый
                  </p>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? "Отпустите файлы" : "Нажмите или перетащите файлы сюда"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Word, Excel, PowerPoint, изображения, архивы
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
                className="hidden"
                onChange={e => e.target.files && processFiles(e.target.files)}
              />

              {/* File list */}
              <AnimatePresence>
                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2"
                  >
                    {uploadedFiles.map((uf, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                          uf.error
                            ? "border-destructive/30 bg-destructive/5"
                            : uf.uploading
                            ? "border-border bg-muted/30"
                            : "border-border bg-background"
                        }`}
                      >
                        {uf.uploading ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                        ) : uf.error ? (
                          <X className="w-4 h-4 text-destructive shrink-0" />
                        ) : (
                          getFileIcon(uf.file)
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">{uf.file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {uf.error
                              ? <span className="text-destructive">{uf.error}</span>
                              : uf.uploading
                              ? "Загрузка..."
                              : formatBytes(uf.file.size)
                            }
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {uploadedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {uploadedFiles.filter(f => !f.uploading && !f.error).length}/{MAX_FILES} файлов загружено
                </p>
              )}
            </div>
          </motion.div>

          {/* ── Right: Payment ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Price card */}
            <div className="bg-card rounded-2xl shadow-elegant border border-border/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Оплата</h2>
                  <p className="text-xs text-muted-foreground">Предоплата за заказ</p>
                </div>
              </div>

              <div className="bg-accent/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Итого:</span>
                  {price ? (
                    <span className="text-3xl font-bold text-gradient">
                      {price.toLocaleString("ru-RU")} ₽
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Заполните параметры</span>
                  )}
                </div>
                {price && (
                  <p className="text-xs text-muted-foreground mt-1">
                    * Точная цена уточняется после консультации
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email для чека *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-11"
                  />
                </div>

                <Button
                  variant="cta"
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={!price || !email || isProcessing || uploadedFiles.some(f => f.uploading)}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Обработка...</>
                  ) : (
                    <><CreditCard className="w-5 h-5" />Оплатить{price ? ` ${price.toLocaleString("ru-RU")} ₽` : ""}</>
                  )}
                </Button>

                {uploadedFiles.some(f => f.uploading) && (
                  <p className="text-xs text-center text-muted-foreground">
                    Дождитесь загрузки всех файлов
                  </p>
                )}
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Безопасная оплата</span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {[
                  "ЮKassa — лицензированный платёжный агрегатор",
                  "СБП, банковские карты, ЮMoney",
                  "Электронный чек на email",
                  "Гарантия возврата при несоответствии",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
