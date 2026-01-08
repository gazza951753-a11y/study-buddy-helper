import { motion } from "framer-motion";
import { 
  Shield, 
  Clock, 
  Award, 
  MessageCircle, 
  RefreshCw, 
  CreditCard 
} from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "./AnimatedSection";

const features = [
  {
    icon: Shield,
    title: "100% конфиденциальность",
    description: "Ваши данные надёжно защищены. Никто не узнает о заказе.",
  },
  {
    icon: Clock,
    title: "Точно в срок",
    description: "Сдаём работы вовремя, даже в сжатые сроки.",
  },
  {
    icon: Award,
    title: "Проверенные авторы",
    description: "Более 500 экспертов с профильным образованием.",
  },
  {
    icon: MessageCircle,
    title: "Связь 24/7",
    description: "Поддержка всегда на связи в мессенджерах.",
  },
  {
    icon: RefreshCw,
    title: "Бесплатные правки",
    description: "Доработки по замечаниям преподавателя бесплатно.",
  },
  {
    icon: CreditCard,
    title: "Оплата частями",
    description: "Платите после проверки или по частям.",
  },
];

const USPSection = () => {
  return (
    <section id="services" className="py-24 bg-card relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-card" />

      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            Почему выбирают нас
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            6 причин заказать у нас
          </h2>
          <p className="text-lg text-muted-foreground">
            Мы создали сервис, который действительно помогает студентам
            сдавать сессии без лишнего стресса
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <motion.div
                className="group relative bg-background rounded-2xl p-6 sm:p-8 border border-border overflow-hidden h-full"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Hover gradient overlay */}
                <motion.div
                  className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                {/* All icons use primary color for consistency */}
                <motion.div
                  className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-6 relative z-10"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default USPSection;
