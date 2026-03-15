"use client";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OfferPage() {
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
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Публичная оферта</h1>
        <p className="text-muted-foreground mb-10 text-sm">Последнее обновление: 15 марта 2026 г.</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Общие положения</h2>
            <p>Настоящий документ является публичной офертой (далее — Оферта) сервиса StudyAssist (далее — Исполнитель) и содержит все существенные условия договора об оказании консультационных услуг в сфере образования.</p>
            <p className="mt-3">Оплата заказа на сайте studyassist.ru означает полное и безоговорочное принятие условий настоящей Оферты (акцепт) в соответствии со ст. 438 ГК РФ.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Предмет договора</h2>
            <p>Исполнитель оказывает Заказчику консультационные услуги в сфере образования: подготовку учебных материалов (курсовых, дипломных работ, рефератов, контрольных работ, презентаций и пр.) в соответствии с заданием Заказчика.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Стоимость и порядок оплаты</h2>
            <p>Стоимость услуг определяется на основании типа работы, предмета и срока выполнения. Оплата производится в рублях РФ через платёжный сервис ЮKassa (ООО НКО «ЮМани»). Договор считается заключённым с момента поступления оплаты.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Сроки выполнения</h2>
            <p>Сроки выполнения работы согласовываются при оформлении заказа. Исполнитель приступает к работе не позднее 24 часов после поступления оплаты.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Права и обязанности Исполнителя</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li>Выполнить работу в указанные сроки в соответствии с заданием</li>
              <li>Обеспечить уникальность материалов</li>
              <li>Вносить правки в течение 30 дней по замечаниям Заказчика</li>
              <li>Соблюдать конфиденциальность персональных данных</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Права и обязанности Заказчика</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li>Предоставить полное и точное задание на выполнение работы</li>
              <li>Произвести оплату в соответствии с условиями заказа</li>
              <li>Использовать полученные материалы в соответствии с законодательством РФ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Возврат денежных средств</h2>
            <p>Возврат осуществляется в случае невозможности выполнения заказа Исполнителем либо если результат работы существенно не соответствует заданию после использования права на доработки. Заявка рассматривается в течение 5 рабочих дней.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Применимое право</h2>
            <p>К отношениям сторон применяется законодательство Российской Федерации.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Реквизиты и контакты</h2>
            <p>StudyAssist · <a href="mailto:support@studyassist.ru" className="text-primary hover:underline">support@studyassist.ru</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
