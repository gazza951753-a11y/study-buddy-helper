import { GraduationCap } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: "Курсовые работы", href: "#" },
      { label: "Дипломные работы", href: "#" },
      { label: "Рефераты", href: "#" },
      { label: "Контрольные работы", href: "#" },
      { label: "Презентации", href: "#" },
    ],
    company: [
      { label: "О нас", href: "#" },
      { label: "Отзывы", href: "#reviews" },
      { label: "Блог", href: "#" },
      { label: "Вакансии", href: "#" },
      { label: "Контакты", href: "#contacts" },
    ],
    legal: [
      { label: "Политика конфиденциальности", href: "/privacy" },
      { label: "Пользовательское соглашение", href: "/terms" },
      { label: "Оферта", href: "#" },
    ],
  };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background">
                Study<span className="text-primary">Assist</span>
              </span>
            </a>
            <p className="text-background/70 leading-relaxed mb-6">
              Помогаем студентам успешно сдавать сессии с 2020 года. 
              Качественные консультации по всем видам учебных работ.
            </p>
            <div className="flex gap-4">
              {/* Telegram */}
              <a
                href="https://t.me/supprot_studyAssist"
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/79539246817"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.898-1.423A9.959 9.959 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm4.926 13.25c-.207.583-1.215 1.115-1.66 1.182-.445.067-.863.316-2.906-.605-2.423-1.091-3.98-3.57-4.099-3.733-.12-.163-.982-1.308-.982-2.493 0-1.185.62-1.766.84-2.007.218-.24.476-.301.635-.301h.457c.147 0 .347-.057.543.414.2.481.678 1.663.738 1.783.06.12.1.26.018.417-.08.157-.12.253-.238.39-.119.136-.25.304-.357.409-.12.116-.244.242-.105.474.14.232.621 1.026 1.334 1.662.916.816 1.688 1.068 1.927 1.19.238.12.376.1.515-.06.14-.16.594-.694.753-.933.158-.24.317-.2.535-.12.218.08 1.385.654 1.622.773.237.12.397.179.456.28.06.1.06.58-.148 1.158z"/>
                </svg>
              </a>
              {/* VK */}
              <a
                href="https://vk.com/supp0rt_studyassist"
                target="_blank"
                rel="noopener noreferrer"
                title="VK"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.31h-1.64c-.62 0-.81-.5-1.92-1.61-1-.95-1.41-1.08-1.66-1.08-.33 0-.43.09-.43.54v1.47c0 .39-.12.62-1.16.62-1.71 0-3.61-1.04-4.95-2.97C5 10.24 4.56 8.62 4.56 8.28c0-.25.09-.48.54-.48h1.64c.4 0 .55.18.7.6.77 2.22 2.06 4.17 2.59 4.17.2 0 .29-.09.29-.59V9.79c-.06-1.06-.62-1.15-.62-1.53 0-.19.15-.38.39-.38h2.58c.34 0 .46.18.46.57v3.07c0 .34.15.46.25.46.2 0 .37-.12.74-.49 1.15-1.29 1.97-3.26 1.97-3.26.11-.23.29-.44.69-.44h1.64c.49 0 .6.25.49.58-.2.94-2.18 3.73-2.18 3.73-.17.28-.23.4 0 .71.17.23.72.71 1.09 1.14.68.77 1.2 1.41 1.34 1.86.12.44-.11.66-.54.66z"/>
                </svg>
              </a>
              {/* Макс */}
              <a
                href="https://max.ru/u/f9LHodD0cOJnmtYpL4gjVCqE1fwx2a9yZZn3aFM2BrTatvM4GtkWCWQyCwY"
                target="_blank"
                rel="noopener noreferrer"
                title="Мессенджер Макс"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 42 42" fill="currentColor">
                  <path fillRule="evenodd" d="M21.47 41.88c-4.11 0-6.02-.6-9.34-3-2.1 2.7-8.75 4.81-9.04 1.2 0-2.71-.6-5-1.28-7.5C1 29.5.08 26.07.08 21.1.08 9.23 9.82.3 21.36.3c11.55 0 20.6 9.37 20.6 20.91a20.6 20.6 0 0 1-20.49 20.67Zm.17-31.32c-5.62-.29-10 3.6-10.97 9.7-.8 5.05.62 11.2 1.83 11.52.58.14 2.04-1.04 2.95-1.95a10.4 10.4 0 0 0 5.08 1.81 10.7 10.7 0 0 0 11.19-9.97 10.7 10.7 0 0 0-10.08-11.1Z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold text-background mb-6">Услуги</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold text-background mb-6">Компания</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold text-background mb-6">Документы</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/50 text-sm text-center md:text-left">
              © {currentYear} StudyAssist. Все права защищены.
              Оказываем консультационные услуги.
            </p>
            <div className="flex items-center gap-6">
              <img 
                src="https://yookassa.ru/themes/flavor/front/img/yookassa-footer-logo.svg" 
                alt="ЮKassa" 
                className="h-6 opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
