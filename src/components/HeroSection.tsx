"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Shield,
  Award,
  MessageCircle,
  Star,
} from "lucide-react";
import { useRef } from "react";

const HeroSection = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const benefits = [
    "Гарантия качества",
    "Оплата после проверки",
    "Бесплатные доработки",
  ];

  const scrollToContacts = () => {
    document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" });
  };

  const workTypes = [
    { label: "Курсовые работы", icon: "📚" },
    { label: "Дипломные работы", icon: "🎓" },
    { label: "Рефераты", icon: "📝" },
    { label: "Контрольные", icon: "✏️" },
    { label: "Презентации", icon: "📊" },
    { label: "Тесты и экзамены", icon: "🏆" },
  ];

  return (
    <section ref={containerRef} className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-background">
      {/* ── Animated Background ── */}
      <motion.div className="absolute inset-0 -z-10" style={{ y: backgroundY }}>
        {/* Large blobs */}
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(252 87% 57% / 0.12) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(272 75% 62% / 0.10) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(295 70% 60% / 0.08) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(hsl(252 87% 57%) 1px, transparent 1px), linear-gradient(90deg, hsl(252 87% 57%) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${4 + (i % 3) * 4}px`,
              height: `${4 + (i % 3) * 4}px`,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 4) * 18}%`,
              background: i % 2 === 0
                ? "hsl(252 87% 57% / 0.4)"
                : "hsl(272 75% 62% / 0.4)",
            }}
            animate={{
              y: [0, -24, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + i * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </motion.div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ── Left Column ── */}
          <motion.div
            className="text-center lg:text-left space-y-8"
            style={{ y: textY, opacity }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold border border-primary/20 bg-primary/8"
              style={{ background: "hsl(252 87% 57% / 0.08)" }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary">Помощь студентам с 2020 года</span>
              <span className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05]">
                Сдай сессию{" "}
                <span className="text-gradient">без стресса</span>
                <br />
                <span className="text-foreground">и точно в срок</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Профессиональная помощь с курсовыми, дипломами, рефератами
              и контрольными. Индивидуальный подход, гарантия результата.
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2 text-foreground font-medium"
                >
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="cta"
                  size="lg"
                  onClick={() => router.push("/payment")}
                  className="text-base px-8 font-bold"
                >
                  Заказать работу
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={scrollToContacts}
                  className="text-base px-8"
                >
                  Задать вопрос
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="grid grid-cols-3 gap-4 pt-8 border-t border-border"
            >
              {[
                { value: "5 000+", label: "Выполнено работ" },
                { value: "98%", label: "Довольных клиентов" },
                { value: "24/7", label: "Поддержка" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 200 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl sm:text-3xl font-extrabold text-gradient">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right Column — Services card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, type: "spring", stiffness: 100 }}
            className="relative"
          >
            {/* Main card */}
            <div className="relative bg-card rounded-3xl p-8 shadow-elegant border border-border/50 overflow-hidden">
              {/* Card gradient overlay */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at top right, hsl(252 87% 57% / 0.08) 0%, transparent 60%)" }}
              />

              <div className="relative z-10">
                {/* Card header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Виды работ</div>
                    <div className="text-xs text-muted-foreground">Любой предмет и сложность</div>
                  </div>
                </div>

                {/* Work types grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {workTypes.map((type, i) => (
                    <motion.div
                      key={type.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.07 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-background border border-border/60 cursor-default transition-shadow hover:shadow-md"
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-sm font-medium text-foreground">{type.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Trust indicators */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Shield, label: "Конфиденциально" },
                    { icon: Clock, label: "Точно в срок" },
                    { icon: Award, label: "Проверенные авторы" },
                    { icon: MessageCircle, label: "Поддержка 24/7" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA in card */}
                <Button
                  variant="cta"
                  className="w-full text-base font-bold h-12"
                  onClick={() => router.push("/payment")}
                >
                  Оставить заявку
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  Бесплатная консультация · Ответ за 5 минут
                </p>
              </div>
            </div>

            {/* Floating badge — top right */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-card rounded-2xl px-4 py-3 shadow-elegant border border-border/50 hidden sm:flex items-center gap-2"
            >
              <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-foreground">500+ авторов онлайн</span>
            </motion.div>

            {/* Floating badge — bottom left */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-card rounded-2xl px-4 py-3 shadow-elegant border border-border/50 hidden sm:block"
            >
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-xs font-semibold text-foreground">4.9 / 5.0 рейтинг</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
