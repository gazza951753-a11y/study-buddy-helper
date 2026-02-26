import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { AnimatedSection } from "./AnimatedSection";

const reviews = [
  {
    name: "Анна М.",
    avatarFile: "anna.png",
    initials: "А",
    role: "Студентка, Экономика",
    rating: 5,
    text: "Заказывала курсовую по микроэкономике. Сделали за неделю, преподаватель даже похвалил за качество анализа. Очень довольна!",
    date: "2 недели назад",
  },
  {
    name: "Дмитрий К.",
    avatarFile: "dmitriy.png",
    initials: "Д",
    role: "Студент, Юриспруденция",
    rating: 5,
    text: "Срочно нужен был диплом, оставалось 2 недели до защиты. Ребята справились, защитился на отлично. Рекомендую!",
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
    text: "Заказывал курсовую по программированию. Код чистый, документация отличная. Преподаватель был в восторге!",
    date: "1 неделю назад",
  },
  {
    name: "Ольга В.",
    avatarFile: "olga.png",
    initials: "О",
    role: "Студентка, Медицина",
    rating: 5,
    text: "Сложная тема по анатомии — справились на ура. Очень благодарна за терпение и профессионализм!",
    date: "4 дня назад",
  },
];

/** Аватарка: фото если есть, иначе буква */
const Avatar = ({
  avatarFile,
  initials,
  size = "md",
}: {
  avatarFile: string;
  initials: string;
  size?: "md";
}) => {
  const [failed, setFailed] = useState(false);
  const cls = "w-12 h-12 rounded-full object-cover";

  if (!failed) {
    return (
      <img
        src={`/avatars/${avatarFile}`}
        alt={initials}
        className={cls}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg">
      {initials}
    </div>
  );
};

const ReviewsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const nextReview = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section id="reviews" ref={containerRef} className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Floating elements */}
      <motion.div
        className="absolute top-20 left-10 text-6xl opacity-10"
        style={{ x }}
      >
        ⭐
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-8xl opacity-10"
        style={{ x: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
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

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
          {reviews.slice(0, 3).map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 50, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-lg"
            >
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              <p className="text-foreground leading-relaxed mb-6">"{review.text}"</p>

              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Star className="w-5 h-5 text-accent fill-accent" />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <Avatar avatarFile={review.avatarFile} initials={review.initials} />
                </motion.div>
                <div>
                  <div className="font-semibold text-foreground">{review.name}</div>
                  <div className="text-sm text-muted-foreground">{review.role}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-4">{review.date}</div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-lg"
          >
            <Quote className="w-10 h-10 text-primary/20 mb-4" />
            <p className="text-foreground leading-relaxed mb-6">"{reviews[activeIndex].text}"</p>

            <div className="flex gap-1 mb-6">
              {[...Array(reviews[activeIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-accent fill-accent" />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Avatar
                avatarFile={reviews[activeIndex].avatarFile}
                initials={reviews[activeIndex].initials}
              />
              <div>
                <div className="font-semibold text-foreground">{reviews[activeIndex].name}</div>
                <div className="text-sm text-muted-foreground">{reviews[activeIndex].role}</div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={prevReview}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              {reviews.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeIndex ? "bg-primary" : "bg-muted"
                  }`}
                  whileHover={{ scale: 1.5 }}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={nextReview}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <motion.div
          className="text-center mt-12"
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
