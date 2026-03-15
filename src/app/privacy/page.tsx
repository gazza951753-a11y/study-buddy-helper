"use client";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Политика конфиденциальности</h1>
        <p className="text-muted-foreground mb-10 text-sm">Последнее обновление: 15 марта 2026 г.</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Общие положения</h2>
            <p>Настоящая Политика конфиденциальности (далее — Политика) описывает порядок сбора, хранения, использования и защиты персональных данных пользователей сервиса StudyAssist (далее — Сервис), доступного по адресу studyassist.ru.</p>
            <p className="mt-3">Используя Сервис, вы соглашаетесь с условиями настоящей Политики. Если вы не согласны с данными условиями, пожалуйста, прекратите использование Сервиса.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Какие данные мы собираем</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Имя (логин), адрес электронной почты, номер телефона — при регистрации</li>
              <li>Имя пользователя Telegram — по желанию</li>
              <li>Данные об оплате — обрабатываются платёжным оператором ЮKassa, мы не храним данные банковских карт</li>
              <li>Технические данные: IP-адрес, тип браузера, данные cookie, статистика посещений</li>
              <li>Содержание заказов и переписки в рамках Сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Как мы используем данные</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Для обработки и исполнения заказов</li>
              <li>Для связи с пользователем по вопросам заказов</li>
              <li>Для улучшения качества Сервиса</li>
              <li>Для отправки уведомлений, связанных с заказом (не рекламных)</li>
              <li>Для соблюдения требований законодательства РФ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Передача данных третьим лицам</h2>
            <p>Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением:</p>
            <ul className="space-y-2 list-disc list-inside mt-3">
              <li>Платёжного оператора ЮKassa — для обработки платежей</li>
              <li>Случаев, предусмотренных законодательством РФ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Хранение и защита данных</h2>
            <p>Данные хранятся на защищённых серверах Supabase (ЕС/США). Мы применяем технические и организационные меры для защиты данных от несанкционированного доступа, изменения или уничтожения.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Cookie</h2>
            <p>Сервис использует файлы cookie для корректной работы, аналитики (Яндекс.Метрика) и улучшения пользовательского опыта. Вы можете отключить cookie в настройках браузера, однако это может повлиять на работу Сервиса.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Права пользователя</h2>
            <p>Вы вправе запросить доступ к своим данным, их исправление или удаление, направив запрос на <a href="mailto:support@studyassist.ru" className="text-primary hover:underline">support@studyassist.ru</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Изменения Политики</h2>
            <p>Мы вправе обновлять настоящую Политику. Актуальная версия всегда доступна на этой странице. Продолжая использовать Сервис после изменений, вы принимаете обновлённую Политику.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Контакты</h2>
            <p>По вопросам, связанным с обработкой персональных данных, обращайтесь: <a href="mailto:support@studyassist.ru" className="text-primary hover:underline">support@studyassist.ru</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
