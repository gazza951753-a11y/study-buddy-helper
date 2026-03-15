"use client";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Users, Award, Clock, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
              <Award className="w-4 h-4" />
              С 2020 года на рынке
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6">
              О компании <span className="text-gradient">StudyAssist</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Мы помогаем студентам успешно сдавать сессии с 2020 года. За это время мы выполнили
              более 5 000 работ и завоевали доверие тысяч студентов по всей России.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: "5 000+", label: "Выполненных работ", icon: Award },
              { value: "500+",   label: "Экспертов-авторов",  icon: Users },
              { value: "98%",    label: "Довольных клиентов", icon: Star },
              { value: "24/7",   label: "Поддержка",          icon: Clock },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-card rounded-2xl border border-border p-6 text-center">
                <Icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <div className="text-2xl font-extrabold text-gradient mb-1">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* About text */}
          <div className="prose prose-gray max-w-none space-y-6 text-muted-foreground leading-relaxed mb-16">
            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Наша миссия</h2>
              <p>
                StudyAssist — сервис профессиональной помощи студентам с учебными работами.
                Мы не просто пишем работы — мы помогаем студентам лучше понять материал,
                успешно защитить проекты и освободить время для того, что действительно важно.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Как мы работаем</h2>
              <p className="mb-4">
                Команда StudyAssist объединяет более 500 проверенных экспертов с высшим образованием
                в различных областях: праве, экономике, медицине, IT, гуманитарных и технических науках.
              </p>
              <p>
                Каждый автор проходит строгий отбор и подтверждает свою квалификацию. Мы работаем
                только с теми, кто гарантирует качество и соблюдение сроков.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Наши гарантии</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Shield, text: "Уникальность от 70% по Антиплагиат" },
                  { icon: Clock,  text: "Соблюдение сроков — всегда" },
                  { icon: Award,  text: "Бесплатные доработки 30 дней" },
                  { icon: Shield, text: "Полная конфиденциальность данных" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground font-medium text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button variant="cta" size="lg" onClick={() => router.push("/payment")} className="text-base px-10">
              Заказать работу
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
