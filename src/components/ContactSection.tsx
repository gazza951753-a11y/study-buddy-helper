import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Заявка отправлена!",
      description: "Мы свяжемся с вами в ближайшее время.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "help@eduhelp.ru",
      href: "mailto:help@eduhelp.ru",
    },
    {
      icon: Phone,
      label: "Телефон",
      value: "+7 (800) 123-45-67",
      href: "tel:+78001234567",
    },
    {
      icon: MessageCircle,
      label: "Telegram",
      value: "@eduhelp_bot",
      href: "https://t.me/eduhelp_bot",
    },
    {
      icon: MapPin,
      label: "Работаем",
      value: "Онлайн по всей России",
      href: null,
    },
  ];

  return (
    <section id="contacts" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            Контакты
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Свяжитесь с нами
          </h2>
          <p className="text-lg text-muted-foreground">
            Готовы ответить на ваши вопросы 24/7
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-elegant">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Оставить заявку
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ваше имя
                  </label>
                  <Input 
                    placeholder="Как вас зовут?" 
                    required 
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email или телефон
                  </label>
                  <Input 
                    placeholder="Для обратной связи" 
                    required 
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Тема обращения
                </label>
                <Input 
                  placeholder="Например: Курсовая по экономике" 
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Описание задания
                </label>
                <Textarea 
                  placeholder="Расскажите подробнее о вашей работе, требованиях и сроках..." 
                  className="min-h-[120px] resize-none"
                />
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Отправить заявку"}
                <Send className="w-5 h-5" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Нажимая кнопку, вы соглашаетесь с{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  политикой конфиденциальности
                </a>
              </p>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="grid gap-4">
              {contactInfo.map((info) => (
                <div
                  key={info.label}
                  className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shrink-0">
                    <info.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{info.label}</div>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <span className="font-semibold text-foreground">{info.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Working Hours */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h4 className="font-bold text-foreground mb-4">Режим работы</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Поддержка:</span>
                  <span className="font-medium text-foreground">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span>Время ответа:</span>
                  <span className="font-medium text-foreground">до 15 минут</span>
                </div>
                <div className="flex justify-between">
                  <span>Консультации:</span>
                  <span className="font-medium text-foreground">Бесплатно</span>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="gradient-accent rounded-2xl p-6 text-center">
              <h4 className="text-xl font-bold text-accent-foreground mb-2">
                Нужна срочная помощь?
              </h4>
              <p className="text-accent-foreground/80 mb-4">
                Напишите нам в Telegram — ответим за 5 минут
              </p>
              <Button 
                variant="glass" 
                className="bg-accent-foreground text-accent hover:bg-accent-foreground/90"
              >
                <MessageCircle className="w-5 h-5" />
                Написать в Telegram
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
