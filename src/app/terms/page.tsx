"use client";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
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

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Пользовательское соглашение</h1>
        <p className="text-muted-foreground mb-10 text-sm">Последнее обновление: 15 марта 2026 г.</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Общие положения</h2>
            <p>Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между сервисом StudyAssist (далее — Сервис) и пользователем (далее — Пользователь), использующим услуги Сервиса.</p>
            <p className="mt-3">Регистрируясь на сайте или оформляя заказ, Пользователь подтверждает, что ознакомился с настоящим Соглашением и принимает его условия в полном объёме.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Предмет соглашения</h2>
            <p>Сервис оказывает консультационные услуги в сфере образования: помощь в написании учебных работ (курсовых, дипломных, рефератов, контрольных), подготовка презентаций, помощь с тестами и экзаменами.</p>
            <p className="mt-3">Все материалы предоставляются исключительно в образовательных и ознакомительных целях.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Права и обязанности сторон</h2>
            <h3 className="font-semibold text-foreground mb-2">Сервис обязуется:</h3>
            <ul className="space-y-1 list-disc list-inside mb-4">
              <li>Выполнять заказы в оговорённые сроки</li>
              <li>Обеспечивать уникальность работ от 70% по Антиплагиат</li>
              <li>Хранить конфиденциальность данных Пользователя</li>
              <li>Производить бесплатные доработки в течение 30 дней после сдачи</li>
            </ul>
            <h3 className="font-semibold text-foreground mb-2">Пользователь обязуется:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Предоставлять достоверную информацию при оформлении заказа</li>
              <li>Своевременно производить оплату</li>
              <li>Использовать материалы только в законных целях</li>
              <li>Не передавать доступ к личному кабинету третьим лицам</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Оплата и возврат</h2>
            <p>Оплата производится через платёжный сервис ЮKassa. Возврат средств осуществляется в случае, если выполненная работа не соответствует согласованным требованиям и доработки не устранили несоответствие. Заявка на возврат рассматривается в течение 5 рабочих дней.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Конфиденциальность</h2>
            <p>Сервис гарантирует конфиденциальность персональных данных Пользователя в соответствии с Политикой конфиденциальности. Выполненные работы не публикуются и не передаются третьим лицам.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Ограничение ответственности</h2>
            <p>Сервис не несёт ответственности за результаты защиты или сдачи работы в учебном заведении Пользователя, поскольку итоговая оценка зависит от требований конкретного преподавателя и учебного заведения.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Разрешение споров</h2>
            <p>Все споры решаются путём переговоров. При невозможности достичь соглашения спор передаётся в суд по месту нахождения Сервиса в соответствии с законодательством РФ.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Контакты</h2>
            <p>По всем вопросам: <a href="mailto:support@studyassist.ru" className="text-primary hover:underline">support@studyassist.ru</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
