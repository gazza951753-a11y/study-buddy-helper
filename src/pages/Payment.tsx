"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  GraduationCap,
  ArrowLeft,
  Paperclip,
  X,
  FileText,
  Image,
  Upload,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Phone,
  User,
  Clock,
  Shield,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const workTypes = [
  { value: "essay",        label: "Реферат"           },
  { value: "coursework",   label: "Курсовая работа"   },
  { value: "diploma",      label: "Дипломная работа"  },
  { value: "control",      label: "Контрольная работа"},
  { value: "practice",     label: "Отчёт по практике" },
  { value: "presentation", label: "Презентация"       },
  { value: "test",         label: "Тест / Экзамен"    },
];

const subjects = [
  { value: "law",        label: "Юриспруденция"   },
  { value: "economics",  label: "Экономика"        },
  { value: "management", label: "Менеджмент"       },
  { value: "psychology", label: "Психология"       },
  { value: "pedagogy",   label: "Педагогика"       },
  { value: "marketing",  label: "Маркетинг"        },
  { value: "it",         label: "Информатика / IT" },
  { value: "medicine",   label: "Медицина"         },
  { value: "history",    label: "История"          },
  { value: "other",      label: "Другое"           },
];

const deadlines = [
  { value: "1",  label: "1 день (срочно)" },
  { value: "3",  label: "3 дня"           },
  { value: "7",  label: "1 неделя"        },
  { value: "14", label: "2 недели"        },
  { value: "30", label: "1 месяц"         },
];

const MAX_FILES   = 10;
const MAX_SIZE_MB = 20;

type UploadedFile = {
  file: File;
  path: string;
  url: string;
  uploading: boolean;
  error?: string;
};

function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) return <Image className="w-4 h-4 text-primary" />;
  return <FileText className="w-4 h-4 text-primary" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const Payment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Order fields
  const [workType,     setWorkType]     = useState(searchParams.get("type")     || "");
  const [subject,      setSubject]      = useState(searchParams.get("subject")  || "");
  const [deadline,     setDeadline]     = useState(searchParams.get("deadline") || "");
  const [description,  setDescription]  = useState("");

  // Contact fields
  const [contactName,     setContactName]     = useState("");
  const [contactPhone,    setContactPhone]    = useState("");
  const [contactTelegram, setContactTelegram] = useState("");
  const [contactEmail,    setContactEmail]    = useState("");

  // UI state
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [isDragging,  setIsDragging]  = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // ── File upload ──
  const uploadFile = useCallback(async (file: File): Promise<{ path: string; url: string } | null> => {
    const ext  = file.name.split(".").pop() || "bin";
    const path = `orders/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("order-attachments")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      console.error("Storage upload error:", uploadError.message, uploadError);
      return null;
    }
    const { data: signed } = await supabase.storage
      .from("order-attachments")
      .createSignedUrl(path, 7 * 24 * 3600);
    return { path, url: signed?.signedUrl || "" };
  }, []);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const existing = uploadedFiles.map(f => f.file.name + f.file.size);
    const fresh = arr.filter(f => !existing.includes(f.name + f.size));
    const allowed = fresh.slice(0, MAX_FILES - uploadedFiles.length);
    if (!allowed.length) return;

    if (allowed.some(f => f.size > MAX_SIZE_MB * 1024 * 1024)) {
      toast({ title: "Файл слишком большой", description: `Максимум ${MAX_SIZE_MB} МБ`, variant: "destructive" });
      return;
    }

    // Insert placeholders at the END so indices are stable
    const placeholders: UploadedFile[] = allowed.map(f => ({ file: f, path: "", url: "", uploading: true }));
    setUploadedFiles(prev => [...prev, ...placeholders]);

    const results = await Promise.all(allowed.map(f => uploadFile(f).catch(() => null)));

    setUploadedFiles(prev => {
      // Replace the placeholders we just added (last allowed.length entries)
      const next = [...prev];
      const start = next.length - allowed.length;
      for (let i = 0; i < allowed.length; i++) {
        const res = results[i];
        next[start + i] = res
          ? { ...next[start + i], path: res.path, url: res.url, uploading: false }
          : { ...next[start + i], uploading: false, error: "Ошибка загрузки. Файл будет отправлен вручную." };
      }
      return next;
    });

    const failed = results.filter(r => !r).length;
    if (failed > 0) {
      toast({
        title: "Не удалось загрузить файл(ы)",
        description: "Хранилище не настроено. Прикрепите файлы в Telegram после отправки заявки.",
        variant: "destructive",
      });
    }
  }, [uploadedFiles, uploadFile, toast]);

  const removeFile = (idx: number) => setUploadedFiles(prev => prev.filter((_, i) => i !== idx));

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop      = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workType || !subject || !deadline) {
      toast({ title: "Заполните обязательные поля", description: "Выберите тип работы, предмет и срок", variant: "destructive" });
      return;
    }
    if (!contactPhone && !contactTelegram && !contactEmail) {
      toast({ title: "Укажите контакт", description: "Хотя бы один способ связи обязателен", variant: "destructive" });
      return;
    }
    if (uploadedFiles.some(f => f.uploading)) {
      toast({ title: "Подождите", description: "Файлы ещё загружаются", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const successfulUrls  = uploadedFiles.filter(f => !f.error && f.url).map(f => f.url);
      const successfulNames = uploadedFiles.filter(f => !f.error && f.url).map(f => f.file.name);

      const workLabel     = workTypes.find(w => w.value === workType)?.label  || workType;
      const subjectLabel  = subjects.find(s => s.value === subject)?.label   || subject;
      const deadlineLabel = deadlines.find(d => d.value === deadline)?.label || deadline;

      // Try to get logged-in user profile
      const { data: { session } } = await supabase.auth.getSession();
      let studentId: string | null = null;

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        studentId = profile?.id ?? null;
      }

      // Save to DB
      await supabase.from("orders").insert({
        work_type:        workType,
        subject,
        deadline_days:    Number(deadline),
        title:            description || null,
        price:            0,
        status:           "new" as const,
        attachment_urls:  successfulUrls,
        contact_name:     contactName || null,
        contact_phone:    contactPhone || null,
        contact_telegram: contactTelegram || null,
        student_id:       studentId,
      });

      // Notify Telegram — include file names even if upload failed, so admin knows files exist
      const allFileNames = uploadedFiles.map(f => f.file.name);
      const failedNames  = uploadedFiles.filter(f => f.error).map(f => f.file.name);
      const contact = [contactPhone, contactTelegram, contactEmail].filter(Boolean).join(" | ");

      let messageBody = description || undefined;
      if (failedNames.length > 0) {
        const note = `\n\n⚠️ Файлы НЕ загружены в хранилище (запросить у клиента): ${failedNames.join(", ")}`;
        messageBody = (messageBody || "") + note;
      }

      const { error: tgError, data: tgData } = await supabase.functions.invoke("send-telegram", {
        body: {
          name:            contactName || "Клиент",
          contact,
          workType:        workLabel,
          subject:         subjectLabel,
          deadline:        deadlineLabel,
          message:         messageBody,
          attachmentUrls:  successfulUrls.length  ? successfulUrls  : undefined,
          attachmentNames: successfulUrls.length  ? successfulNames : (allFileNames.length ? allFileNames : undefined),
        },
      });

      if (tgError) {
        console.error("Telegram function error:", tgError);
        // Заявка сохранена в БД — всё равно показываем успех, но уведомляем
        toast({ title: "Заявка принята, но уведомление не отправлено", description: tgError.message, variant: "destructive" });
      } else {
        console.log("Telegram response:", tgData);
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast({ title: "Ошибка", description: "Не удалось отправить заявку. Попробуйте ещё раз или напишите нам напрямую.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl shadow-elegant border border-border/50 p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Заявка принята!</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Мы получили вашу заявку и свяжемся с вами в ближайшее время для уточнения деталей и согласования стоимости.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Clock,   label: "Ответ за 15–30 мин" },
              { icon: Shield,  label: "Конфиденциально"    },
              { icon: MessageCircle, label: "Любой мессенджер" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-muted/50 rounded-xl p-3 text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <Button onClick={() => router.push("/")} variant="cta" className="w-full text-base" size="lg">
            Вернуться на главную
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">
              Study<span className="text-gradient">Assist</span>
              <span className="font-normal text-muted-foreground ml-2 text-sm">— Оставить заявку</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/8 border border-primary/20 rounded-2xl p-5 mb-8 flex items-start gap-4"
          style={{ background: "hsl(252 87% 57% / 0.06)" }}
        >
          <MessageCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Как это работает</p>
            <p className="text-sm text-muted-foreground">
              Заполните форму ниже → мы свяжемся с вами в течение 15–30 минут → согласуем стоимость и сроки →
              вы оплачиваете и мы приступаем к работе. <strong className="text-foreground">Оплата только после согласования.</strong>
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8">

            {/* ── Left column: Order details ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

              {/* Work parameters */}
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="text-lg font-bold text-foreground mb-5">Параметры работы</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-1.5 block">Тип работы *</Label>
                    <Select value={workType} onValueChange={setWorkType}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Выберите тип работы" /></SelectTrigger>
                      <SelectContent>{workTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Предмет *</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Выберите предмет" /></SelectTrigger>
                      <SelectContent>{subjects.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Нужный срок *</Label>
                    <Select value={deadline} onValueChange={setDeadline}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Выберите срок" /></SelectTrigger>
                      <SelectContent>{deadlines.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="desc" className="mb-1.5 block">Тема / требования</Label>
                    <Textarea
                      id="desc"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Опишите тему, требования преподавателя, методичку, количество страниц и любые другие детали..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Paperclip className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Прикрепить файлы</h3>
                    <p className="text-xs text-muted-foreground">Методичка, задание, пример — до {MAX_FILES} файлов по {MAX_SIZE_MB} МБ</p>
                  </div>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/20"
                  }`}
                >
                  <Upload className={`w-7 h-7 mx-auto mb-2 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm font-medium text-foreground">{isDragging ? "Отпустите файлы" : "Нажмите или перетащите"}</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, PowerPoint, изображения, архивы</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
                  className="hidden"
                  onChange={e => e.target.files && processFiles(e.target.files)}
                />

                <AnimatePresence>
                  {uploadedFiles.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 space-y-2">
                      {uploadedFiles.map((uf, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                            uf.error ? "border-destructive/30 bg-destructive/5" : "border-border bg-background"
                          }`}
                        >
                          {uf.uploading ? <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" /> :
                           uf.error    ? <X className="w-4 h-4 text-destructive shrink-0" /> :
                           getFileIcon(uf.file)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{uf.file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {uf.error ? <span className="text-destructive">{uf.error}</span> :
                               uf.uploading ? "Загрузка..." : formatBytes(uf.file.size)}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-destructive shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ── Right column: Contacts + submit ── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="text-lg font-bold text-foreground mb-1">Контактные данные</h2>
                <p className="text-sm text-muted-foreground mb-5">Укажите хотя бы один способ связи *</p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cname" className="mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Ваше имя
                    </Label>
                    <Input id="cname" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Как к вам обращаться" className="h-11" />
                  </div>
                  <div>
                    <Label htmlFor="cphone" className="mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Телефон / WhatsApp
                    </Label>
                    <Input id="cphone" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+7 (999) 123-45-67" className="h-11" />
                  </div>
                  <div>
                    <Label htmlFor="ctg" className="mb-1.5 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" /> Telegram
                    </Label>
                    <Input id="ctg" value={contactTelegram} onChange={e => setContactTelegram(e.target.value)} placeholder="@username" className="h-11" />
                  </div>
                  <div>
                    <Label htmlFor="cemail" className="mb-1.5">Email</Label>
                    <Input id="cemail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="your@email.com" className="h-11" />
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h3 className="font-semibold text-foreground mb-4">Наши гарантии</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  {[
                    { icon: CheckCircle2, text: "Оплата только после согласования цены" },
                    { icon: Shield,       text: "Полная конфиденциальность" },
                    { icon: Clock,        text: "Ответ в течение 15–30 минут" },
                    { icon: CheckCircle2, text: "Бесплатные доработки 30 дней" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-success shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="cta"
                size="lg"
                className="w-full text-base font-bold"
                disabled={submitting || uploadedFiles.some(f => f.uploading)}
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Отправляем...</>
                ) : (
                  <><Send className="w-5 h-5" />Отправить заявку</>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Нажимая кнопку, вы соглашаетесь с{" "}
                <a href="/terms" className="text-primary hover:underline">пользовательским соглашением</a>
              </p>
            </motion.div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Payment;
