"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatedSection } from "./AnimatedSection";

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
  const src = `/avatars/${avatarFile}`;
  if (!failed) {
    return (
      <img
        src={src}
        alt={initials}
        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-xl ring-2 ring-primary/20">
      {initials}
    </div>
  );
};

// Позиционирование каждой карточки относительно активной
const getCardProps = (index: number, active: number, total: number) => {
  const pos = ((index - active) % total + total) % total;
  // 0 = центр, 1 = правая, total-1 = левая, остальные скрыты
  if (pos === 0) {
    return { x: "0%", scale: 1, rotateY: 0, opacity: 1, zIndex: 10, visible: true };
  }
  if (pos === 1) {
    return { x: "72%", scale: 0.78, rotateY: -22, opacity: 0.65, zIndex: 5, visible: true };
  }
  if (pos === total - 1) {
    return { x: "-72%", scale: 0.78, rotateY: 22, opacity: 0.65, zIndex: 5, visible: true };
  }
  // остальные — скрыты за боковыми
  return { x: pos < total / 2 ? "120%" : "-120%", scale: 0.5, rotateY: 0, opacity: 0, zIndex: 0, visible: false };
};

const ReviewsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = reviews.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgX = useTransform(scrollYProgress, [0, 1], [80, -80]);

  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  // Автоматическая прокрутка — пауза при наведении
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <section
      id="reviews"
      ref={containerRef}
      className="py-24 bg-secondary/30 relative overflow-hidden"
    >
      {/* Декоративные элементы */}
      <motion.div className="absolute top-16 left-8 text-6xl opacity-10 select-none" style={{ x: bgX }}>
        ⭐
      </motion.div>
      <motion.div
        className="absolute bottom-16 right-8 text-8xl opacity-10 select-none"
        style={{ x: useTransform(scrollYProgress, [0, 1], [-80, 80]) }}
      >
        ✨
      </motion.div>

      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            Отзывы студентов
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Что говорят о нас
          </h2>
          <p className="text-lg text-muted-foreground">
            Более 5000 студентов уже воспользовались нашими услугами
          </p>
        </AnimatedSection>

        {/* ── 3D Карусель ── */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Обёртка с перспективой */}
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
                        <Star key={i} className="w-4 h-4 text-accent fill-accent" />
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

          {/* Кнопки навигации */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Точки-индикаторы */}
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
              className="w-11 h-11 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button variant="outline" size="lg">
            Читать все отзывы
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
