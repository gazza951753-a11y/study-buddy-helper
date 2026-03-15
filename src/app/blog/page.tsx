"use client";
import { ArrowLeft, GraduationCap, BookOpen, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function BlogPage() {
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

      <main className="container mx-auto px-4 py-24 max-w-3xl text-center">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
          <div className="w-24 h-24 rounded-3xl gradient-hero flex items-center justify-center mx-auto shadow-glow">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-foreground mb-4">Блог StudyAssist</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Полезные статьи о том, как писать учебные работы, проходить защиту
              и успешно учиться — скоро здесь.
            </p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-8">
            <Bell className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="font-semibold text-foreground mb-2">Раздел в разработке</p>
            <p className="text-muted-foreground text-sm">
              Мы готовим первые статьи. Следите за обновлениями в нашем{" "}
              <a href="https://t.me/supprot_studyAssist" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Telegram-канале
              </a>.
            </p>
          </div>
          <Button variant="outline" size="lg" onClick={() => router.push("/")}>
            Вернуться на главную
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
