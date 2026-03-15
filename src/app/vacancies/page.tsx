"use client";
import { ArrowLeft, GraduationCap, PenLine, Users, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const requirements = [
  "Высшее образование (профильное)",
  "Опыт написания курсовых или дипломных работ",
  "Грамотность и умение работать с источниками",
  "Соблюдение дедлайнов",
  "Ответственный подход к каждому заказу",
];

const benefits = [
  "Гибкий график — работа из любой точки мира",
  "Стабильный поток заказов",
  "Своевременные выплаты",
  "Поддержка команды и менеджера",
  "Бонусы за постоянство и качество",
];

export default function VacanciesPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            На главную
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Study<span className="text-gradient">Assist</span></span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
              <Users className="w-4 h-4" />
              Открытые вакансии
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6">
              Стань автором <span className="text-gradient">StudyAssist</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Мы постоянно ищем грамотных специалистов, готовых помогать студентам
              с учебными работами. Удалённо, в удобное время.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <PenLine className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-4">Требования</h2>
              <ul className="space-y-3">
                {requirements.map(r => (
                  <li key={r} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-4">Мы предлагаем</h2>
              <ul className="space-y-3">
                {benefits.map(b => (
                  <li key={b} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 p-8 text-center">
            <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Хотите стать автором?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Напишите нам в Telegram или зарегистрируйтесь как автор на сайте —
              менеджер свяжется с вами в течение 24 часов.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="cta" size="lg" asChild>
                <a href="https://t.me/supprot_studyAssist" target="_blank" rel="noopener noreferrer">
                  Написать в Telegram
                </a>
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push("/auth")}>
                Зарегистрироваться как автор
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
