import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModernContactForm from "./ModernContactForm";
import { AnimatedSection } from "./AnimatedSection";

const ContactSection = () => {
  const contactInfo = [
    { icon: Mail, label: "Email", value: "help@eduhelp.ru", href: "mailto:help@eduhelp.ru" },
    { icon: Phone, label: "Телефон", value: "+7 (800) 123-45-67", href: "tel:+78001234567" },
    { icon: MessageCircle, label: "Telegram", value: "@studyHelplessBot", href: "https://t.me/studyHelplessBot" },
    { icon: MapPin, label: "Работаем", value: "Онлайн по всей России", href: null },
  ];

  return (
    <section id="contacts" className="py-24 relative overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            Контакты
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Свяжитесь с нами
          </h2>
          <p className="text-lg text-muted-foreground">Готовы ответить на ваши вопросы 24/7</p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <AnimatedSection delay={0.2}>
            <ModernContactForm />
          </AnimatedSection>

          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 10 }}
                className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl"
              >
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shrink-0">
                  <info.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{info.label}</div>
                  {info.href ? (
                    <a href={info.href} className="font-semibold text-foreground hover:text-primary transition-colors">
                      {info.value}
                    </a>
                  ) : (
                    <span className="font-semibold text-foreground">{info.value}</span>
                  )}
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="gradient-accent rounded-2xl p-6 text-center"
            >
              <h4 className="text-xl font-bold text-accent-foreground mb-2">Нужна срочная помощь?</h4>
              <p className="text-accent-foreground/80 mb-4">Напишите нам в Telegram — ответим за 5 минут</p>
              <Button variant="glass" className="bg-accent-foreground text-accent hover:bg-accent-foreground/90" asChild>
                <a href="https://t.me/studyHelplessBot" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  Написать в Telegram
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
