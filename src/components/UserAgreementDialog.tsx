import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserAgreementDialog = ({ open, onOpenChange }: UserAgreementDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Пользовательское соглашение</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Общие положения</h3>
              <p>
                Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения 
                между сервисом EduHelp (далее — Сервис) и пользователем (далее — Пользователь), 
                использующим услуги Сервиса.
              </p>
              <p className="mt-2">
                Регистрация на сайте означает полное и безоговорочное принятие Пользователем 
                условий настоящего Соглашения.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Описание услуг</h3>
              <p>
                Сервис оказывает консультационные услуги в сфере образования. 
                Мы помогаем студентам разобраться в учебных материалах, понять сложные темы 
                и подготовиться к экзаменам.
              </p>
              <p className="mt-2">
                <strong>Важно:</strong> Сервис предоставляет именно консультационную и 
                информационную помощь. Материалы предназначены для ознакомления и обучения.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Обязанности Пользователя</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Предоставлять достоверную информацию при регистрации и оформлении заказа</li>
                <li>Своевременно проверять и принимать выполненную работу</li>
                <li>Использовать полученные материалы в соответствии с законодательством</li>
                <li>Не передавать данные своей учетной записи третьим лицам</li>
                <li>Соблюдать авторские права и не распространять полученные материалы</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Обязанности Сервиса</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Обеспечивать качественное выполнение заказанных услуг</li>
                <li>Соблюдать оговоренные сроки выполнения</li>
                <li>Обеспечивать конфиденциальность данных Пользователя</li>
                <li>Предоставлять бесплатные доработки в рамках первоначального задания</li>
                <li>Оперативно отвечать на вопросы и обращения Пользователей</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Оплата услуг</h3>
              <p>
                Стоимость услуг определяется индивидуально для каждого заказа и зависит от 
                сложности, объема и сроков выполнения. Оплата производится после согласования 
                всех деталей заказа.
              </p>
              <p className="mt-2">
                Возврат средств возможен в случае невыполнения заказа по вине Сервиса 
                или при существенных расхождениях с первоначальным заданием.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Гарантии</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Гарантия уникальности материалов (проверка на антиплагиат)</li>
                <li>Бесплатные доработки в течение 14 дней после сдачи работы</li>
                <li>Полная конфиденциальность всех данных и заказов</li>
                <li>Возврат средств при несоответствии качества</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">7. Конфиденциальность</h3>
              <p>
                Сервис гарантирует защиту персональных данных Пользователя в соответствии 
                с законодательством о защите персональных данных. Данные не передаются 
                третьим лицам без согласия Пользователя.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">8. Ограничение ответственности</h3>
              <p>
                Сервис не несет ответственности за использование полученных материалов 
                Пользователем. Пользователь самостоятельно определяет способ использования 
                предоставленных консультационных материалов.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">9. Изменение условий</h3>
              <p>
                Сервис оставляет за собой право изменять условия настоящего Соглашения. 
                Актуальная версия всегда доступна на сайте. Продолжение использования 
                Сервиса после изменений означает согласие с новыми условиями.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">10. Контактная информация</h3>
              <p>
                По всем вопросам, связанным с данным Соглашением и работой Сервиса, 
                вы можете обратиться через форму обратной связи на сайте или через 
                Telegram: @ask_eduhelp_bot
              </p>
            </section>

            <p className="pt-4 text-xs text-muted-foreground">
              Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserAgreementDialog;