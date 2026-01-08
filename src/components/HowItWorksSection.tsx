import { motion, useScroll, useTransform } from "framer-motion";
import { FileText, CreditCard, PenTool, CheckCircle, Download } from "lucide-react";
import { useRef } from "react";
import { AnimatedSection } from "./AnimatedSection";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section id="how-it-works" ref={containerRef} className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            Простой процесс
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Как мы работаем
          </h2>
          <p className="text-lg text-muted-foreground">
            5 простых шагов от заявки до успешной сдачи работы
          </p>
        </AnimatedSection>

        <div className="relative">
          {/* Animated Connection Line */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: lineProgress }}
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100,
                }}
                className="relative text-center"
              >
                {/* Step Circle */}
                <motion.div 
                  className="relative mx-auto mb-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow mx-auto relative z-10"
                    whileInView={{
                      boxShadow: [
                        "0 0 20px hsl(229 100% 62% / 0.2)",
                        "0 0 40px hsl(229 100% 62% / 0.4)",
                        "0 0 20px hsl(229 100% 62% / 0.2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold flex items-center justify-center shadow-lg z-20"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                  >
                    {step.number.replace("0", "")}
                  </motion.div>
                </motion.div>

                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
