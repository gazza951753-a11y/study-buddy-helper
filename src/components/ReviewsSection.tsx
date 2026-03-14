"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatedSection } from "./AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const reviews = [
  {
    name: "Анна М.",
    avatarFile: "anna.png",
    initials: "А",
    role: "Студентка, Экономика",
    rating: 5,
    text: "Заказывала курсовую по микроэкономике. Сделали за неделю, преподаватель даже похвалил за качество анализа. Очень довольна результатом!",
    date: "2 недели назад",
  },
  {
    name: "Дмитрий К.",
    avatarFile: "dmitriy.png",
    initials: "Д",
    role: "Студент, Юриспруденция",
    rating: 5,
    text: "Срочно нужен был диплом, оставалось 2 недели до защиты. Ребята справились, защитился на отлично. Рекомендую всем!",
    date: "1 месяц назад",
  },
  {
    name: "Елена С.",
    avatarFile: "elena.png",
    initials: "Е",
    role: "Магистрант, Психология",
    rating: 5,
    text: "Уже третий раз обращаюсь за помощью. Всегда качественно, в срок, учитывают все пожелания. Спасибо за накопительную скидку!",
    date: "3 недели назад",
  },
  {
    name: "Михаил П.",
    avatarFile: "mikhail.png",
    initials: "М",
    role: "Студент, IT",
    rating: 5,
    text: "Заказывал курсовую по программированию. Код чистый, документация отличная. Преподаватель был в восторге от работы!",
    date: "1 неделю назад",
  },
  {
    name: "Ольга В.",
    avatarFile: "olga.png",
    initials: "О",
    role: "Студентка, Медицина",
    rating: 5,
    text: "Сложная тема по анатомии — справились на ура. Очень благодарна за терпение и высокий профессионализм команды!",
    date: "4 дня назад",
  },
];

const Avatar = ({ avatarFile, initials }: { avatarFile: string; initials: string }) => {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      <img
        src={`/avatars/${avatarFile}`}
        alt={initials}
        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center text-white font-bold text-xl ring-2 ring-primary/20">
      {initials}
    </div>
  );
};

const getCardProps = (index: number, active: number, total: number) => {
  const pos = ((index - active) % total + total) % total;
  if (pos === 0) return { x: "0%", scale: 1, rotateY: 0, opacity: 1, zIndex: 10 };
  if (pos === 1) return { x: "72%", scale: 0.78, rotateY: -22, opacity: 0.65, zIndex: 5 };
  if (pos === total - 1) return { x: "-72%", scale: 0.78, rotateY: 22, opacity: 0.65, zIndex: 5 };
  return { x: pos < total / 2 ? "120%" : "-120%", scale: 0.5, rotateY: 0, opacity: 0, zIndex: 0 };
};

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = reviews.length;

  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    role: "",
    rating: 5,
    text: "",
  });

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const bgX = useTransform(scrollYProgress, [0, 1], [80, -80]);

  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, next]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
      toast.error("Заполните имя и текст отзыва");
      return;
    }
    setSending(true);
    try {
      // Load current reviews from site_content
      const { data: existing } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "user_reviews")
        .maybeSingle();

      const currentReviews = Array.isArray(existing?.value) ? existing.value : [];
      const newReview = {
        name: reviewForm.name.trim(),
        role: reviewForm.role.trim() || "Студент",
        rating: reviewForm.rating,
        text: reviewForm.text.trim(),
        date: new Date().toLocaleDateString("ru-RU"),
        approved: false,
      };

      const { error } = await supabase.from("site_content").upsert({
        key: "user_reviews",
        label: "Отзывы пользователей",
        value: [...currentReviews, newReview] as unknown as import("@/integrations/supabase/types").Json,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setFormSent(true);
      setReviewForm({ name: "", role: "", rating: 5, text: "" });
    } catch {
      toast.error("Не удалось отправить отзыв. Попробуйте позже.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="reviews"
      ref={containerRef}
      className="py-24 bg-muted/40 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <motion.div
        className="absolute top-16 left-8 text-7xl opacity-[0.06] select-none pointer-events-none"
        style={{ x: bgX }}
      >
        ⭐
      </motion.div>
      <motion.div
        className="absolute bottom-16 right-8 text-9xl opacity-[0.06] select-none pointer-events-none"
        style={{ x: useTransform(scrollYProgress, [0, 1], [-80, 80]) }}
      >
        ✨
      </motion.div>

      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-4">
            Отзывы студентов
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Что говорят о нас
          </h2>
          <p className="text-lg text-muted-foreground">
            Более 5 000 студентов уже воспользовались нашими услугами
          </p>
        </AnimatedSection>

        {/* ── 3D Carousel ── */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="relative mx-auto h-[340px] sm:h-[320px]"
            style={{ perspective: "1200px", maxWidth: "900px" }}
          >
            {reviews.map((review, index) => {
              const { x, scale, rotateY, opacity, zIndex } = getCardProps(index, active, total);
              const isCenter = ((index - active + total) % total) === 0;

              return (
                <motion.div
                  key={review.name}
                  animate={{ x, scale, rotateY, opacity, zIndex }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  onClick={() => !isCenter && setActive(index)}
                  className="absolute inset-0 cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className={`h-full bg-card rounded-2xl border p-6 sm:p-8 shadow-xl flex flex-col transition-shadow duration-300 ${
                      isCenter
                        ? "border-primary/30 shadow-primary/10"
                        : "border-border cursor-pointer hover:border-primary/20"
                    }`}
                  >
                    <Quote className="w-9 h-9 text-primary/20 mb-3 shrink-0" />
                    <p className="text-foreground leading-relaxed flex-1 text-sm sm:text-base line-clamp-4">
                      "{review.text}"
                    </p>

                    <div className="flex gap-1 mt-4 mb-5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar avatarFile={review.avatarFile} initials={review.initials} />
                      <div>
                        <div className="font-bold text-foreground">{review.name}</div>
                        <div className="text-xs text-muted-foreground">{review.role}</div>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">{review.date}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-7 h-2.5 bg-primary"
                      : "w-2.5 h-2.5 bg-primary/25 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Review Form ── */}
        <motion.div
          className="max-w-2xl mx-auto mt-16"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {!showForm ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Пользовались нашими услугами? Поделитесь впечатлениями!</p>
              <Button variant="outline" size="lg" onClick={() => setShowForm(true)}>
                Оставить отзыв
              </Button>
            </div>
          ) : formSent ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Спасибо за отзыв!</h3>
              <p className="text-muted-foreground mb-6">
                Ваш отзыв отправлен на модерацию и скоро появится на сайте.
              </p>
              <Button
                variant="outline"
                onClick={() => { setFormSent(false); setShowForm(false); }}
              >
                Закрыть
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Написать отзыв</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="review-name">Ваше имя *</Label>
                    <Input
                      id="review-name"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Имя Фамилия"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="review-role">Специальность</Label>
                    <Input
                      id="review-role"
                      value={reviewForm.role}
                      onChange={(e) => setReviewForm(p => ({ ...p, role: e.target.value }))}
                      placeholder="Студент, Экономика"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Оценка *</Label>
                  <StarRating
                    value={reviewForm.rating}
                    onChange={(v) => setReviewForm(p => ({ ...p, rating: v }))}
                  />
                </div>

                <div>
                  <Label htmlFor="review-text">Отзыв *</Label>
                  <Textarea
                    id="review-text"
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm(p => ({ ...p, text: e.target.value }))}
                    placeholder="Расскажите о вашем опыте работы с нами..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" variant="hero" disabled={sending} className="flex-1">
                    {sending ? (
                      "Отправляем..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Отправить отзыв
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                  >
                    Отмена
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Отзыв будет опубликован после проверки модератором
                </p>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
