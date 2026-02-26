import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModernContactForm from "./ModernContactForm";
import { AnimatedSection } from "./AnimatedSection";

// SVG иконки мессенджеров
const TelegramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.898-1.423A9.959 9.959 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm4.926 13.25c-.207.583-1.215 1.115-1.66 1.182-.445.067-.863.316-2.906-.605-2.423-1.091-3.98-3.57-4.099-3.733-.12-.163-.982-1.308-.982-2.493 0-1.185.62-1.766.84-2.007.218-.24.476-.301.635-.301h.457c.147 0 .347-.057.543.414.2.481.678 1.663.738 1.783.06.12.1.26.018.417-.08.157-.12.253-.238.39-.119.136-.25.304-.357.409-.12.116-.244.242-.105.474.14.232.621 1.026 1.334 1.662.916.816 1.688 1.068 1.927 1.19.238.12.376.1.515-.06.14-.16.594-.694.753-.933.158-.24.317-.2.535-.12.218.08 1.385.654 1.622.773.237.12.397.179.456.28.06.1.06.58-.148 1.158z"/>
  </svg>
);

const VKIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.31h-1.64c-.62 0-.81-.5-1.92-1.61-1-.95-1.41-1.08-1.66-1.08-.33 0-.43.09-.43.54v1.47c0 .39-.12.62-1.16.62-1.71 0-3.61-1.04-4.95-2.97C5 10.24 4.56 8.62 4.56 8.28c0-.25.09-.48.54-.48h1.64c.4 0 .55.18.7.6.77 2.22 2.06 4.17 2.59 4.17.2 0 .29-.09.29-.59V9.79c-.06-1.06-.62-1.15-.62-1.53 0-.19.15-.38.39-.38h2.58c.34 0 .46.18.46.57v3.07c0 .34.15.46.25.46.2 0 .37-.12.74-.49 1.15-1.29 1.97-3.26 1.97-3.26.11-.23.29-.44.69-.44h1.64c.49 0 .6.25.49.58-.2.94-2.18 3.73-2.18 3.73-.17.28-.23.4 0 .71.17.23.72.71 1.09 1.14.68.77 1.2 1.41 1.34 1.86.12.44-.11.66-.54.66z"/>
  </svg>
);

// Иконка Макс (официальный SVG, только символ)
const MaxIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 42 42" fill="currentColor">
    <path fillRule="evenodd" d="M21.47 41.88c-4.11 0-6.02-.6-9.34-3-2.1 2.7-8.75 4.81-9.04 1.2 0-2.71-.6-5-1.28-7.5C1 29.5.08 26.07.08 21.1.08 9.23 9.82.3 21.36.3c11.55 0 20.6 9.37 20.6 20.91a20.6 20.6 0 0 1-20.49 20.67Zm.17-31.32c-5.62-.29-10 3.6-10.97 9.7-.8 5.05.62 11.2 1.83 11.52.58.14 2.04-1.04 2.95-1.95a10.4 10.4 0 0 0 5.08 1.81 10.7 10.7 0 0 0 11.19-9.97 10.7 10.7 0 0 0-10.08-11.1Z" clipRule="evenodd"/>
  </svg>
);

const messengers = [
  { icon: TelegramIcon, label: "Telegram", href: "https://t.me/studyAssist_support", color: "hover:bg-[#229ED9]" },
  { icon: WhatsAppIcon, label: "WhatsApp", href: "https://wa.me/79539246817", color: "hover:bg-[#25D366]" },
  { icon: VKIcon, label: "VK", href: "https://vk.com", color: "hover:bg-[#0077FF]" },
  { icon: MaxIcon, label: "Макс", href: "https://max.ru", color: "hover:bg-[#8E44AD]" },
];

const ContactSection = () => {
  const contactInfo = [
    { icon: Mail, label: "Email", value: "support@studyassist.ru", href: "mailto:support@studyassist.ru" },
    { icon: Phone, label: "Телефон", value: "+7 (953) 924-68-17", href: "tel:+79539246817" },
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

            {/* Мессенджеры */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="gradient-accent rounded-2xl p-6"
            >
              <h4 className="text-lg font-bold text-accent-foreground mb-1">Нужна срочная помощь?</h4>
              <p className="text-accent-foreground/80 text-sm mb-5">
                Доступны для связи в мессенджерах и соц. сетях
              </p>

              {/* Иконки мессенджеров */}
              <div className="flex items-center gap-3 mb-5">
                {messengers.map(({ icon: Icon, label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className={`w-11 h-11 rounded-xl bg-accent-foreground/15 flex items-center justify-center text-accent-foreground transition-all hover:text-white hover:scale-110 ${color}`}
                  >
                    <Icon />
                  </a>
                ))}
                <span className="ml-1 text-sm text-accent-foreground/70">
                  Telegram · WhatsApp · VK · Макс
                </span>
              </div>

              <Button variant="glass" className="bg-accent-foreground text-accent hover:bg-accent-foreground/90 w-full sm:w-auto" asChild>
                <a href="https://t.me/studyAssist_support" target="_blank" rel="noopener noreferrer">
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
