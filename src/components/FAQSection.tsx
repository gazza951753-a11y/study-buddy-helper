import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Как происходит оплата и какие гарантии безопасности?",
    answer: "Мы работаем по предоплате через проверенные платёжные системы: ЮMoney и СБП. Это защищает обе стороны — вы получаете чек и подтверждение платежа, а мы гарантируем выполнение заказа. Для крупных проектов возможна поэтапная оплата. Все транзакции безопасны и конфиденциальны.",
  },
  {
    question: "Какие гарантии вы предоставляете?",
    answer: "Гарантируем уникальность работы (проверка по Антиплагиат), соблюдение сроков, бесплатные доработки по замечаниям преподавателя в течение 30 дней после сдачи.",
  },
  {
    question: "Можно ли срочно заказать работу?",
    answer: "Да, выполняем срочные заказы от 1 дня. Стоимость срочного выполнения зависит от сложности и объёма работы. Уточните у менеджера.",
  },
  {
    question: "Как связаться с автором?",
    answer: "Вы можете общаться с автором через личный кабинет или Telegram. Менеджер всегда на связи для решения любых вопросов.",
  },
  {
    question: "Что если работа не понравится преподавателю?",
    answer: "Мы бесплатно внесём правки по замечаниям преподавателя. Наша цель — ваша успешная сдача, поэтому работаем до результата.",
  },
  {
    question: "Насколько уникальной будет работа?",
    answer: "Каждая работа пишется индивидуально под ваше задание. Гарантируем уникальность от 70% по системе Антиплагиат (или выше по вашим требованиям).",
  },
  {
    question: "Конфиденциальны ли мои данные?",
    answer: "Абсолютно. Мы не передаём данные третьим лицам и не публикуем выполненные работы. Ваша безопасность — наш приоритет.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 pb-48">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            Частые вопросы
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            FAQ
          </h2>
          <p className="text-lg text-muted-foreground">
            Ответы на популярные вопросы о нашем сервисе
          </p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-lg transition-all"
                >
                  <AccordionTrigger className="text-left text-foreground font-semibold hover:text-primary py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
