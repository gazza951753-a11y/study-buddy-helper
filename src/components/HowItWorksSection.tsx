import { FileText, CreditCard, PenTool, CheckCircle, Download } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Оставьте заявку",
    description: "Заполните форму или напишите в чат. Расскажите о задании и сроках.",
  },
  {
    icon: CreditCard,
    number: "02",
    title: "Получите расчёт",
    description: "Менеджер свяжется с вами и назовёт точную стоимость и сроки.",
  },
  {
    icon: PenTool,
    number: "03",
    title: "Работа в процессе",
    description: "Эксперт выполняет задание. Вы можете отслеживать прогресс.",
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Проверка и правки",
    description: "Получите работу, проверьте. Внесём правки при необходимости.",
  },
  {
    icon: Download,
    number: "05",
    title: "Сдайте и забудьте",
    description: "Оплатите после успешной сдачи. Готово — вы свободны!",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-accent/10 rounded-full text-accent font-medium text-sm mb-4">
            Простой процесс
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Как мы работаем
          </h2>
          <p className="text-lg text-muted-foreground">
            5 простых шагов от заявки до успешной сдачи работы
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center animate-fade-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Step Circle */}
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center shadow-glow mx-auto">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                    {step.number.replace("0", "")}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
