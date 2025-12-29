import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Calculator from "./Calculator";

const HeroSection = () => {
  const benefits = [
    "Гарантия качества",
    "Оплата после проверки",
    "Бесплатные доработки",
  ];

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Помощь студентам с 2020 года
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight animate-fade-up">
              Сдай сессию{" "}
              <span className="text-gradient">без стресса</span>
              <br />
              и в срок
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Консультации по всем видам учебных работ: курсовые, дипломы, рефераты, 
              контрольные. Индивидуальный подход к каждому заказу.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-foreground"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl">
                Сделать заказ
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl">
                Задать вопрос
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">Выполненных работ</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Довольных клиентов</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Поддержка</div>
              </div>
            </div>
          </div>

          {/* Right Column - Calculator */}
          <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <Calculator />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
