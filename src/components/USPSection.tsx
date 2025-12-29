import { 
  Shield, 
  Clock, 
  Award, 
  MessageCircle, 
  RefreshCw, 
  CreditCard 
} from "lucide-react";

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
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
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
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 sm:p-8 border border-border hover:border-primary/30 hover:shadow-elegant transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default USPSection;
