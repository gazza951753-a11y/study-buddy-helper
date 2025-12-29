import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  User, 
  Phone, 
  FileText, 
  MessageSquare,
  CheckCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSteps = [
  { id: "info", label: "Контакты", icon: User },
  { id: "details", label: "Детали", icon: FileText },
  { id: "message", label: "Описание", icon: MessageSquare },
];

const ModernContactForm = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    subject: "",
    workType: "",
    deadline: "",
    message: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.contact) {
      toast({
        title: "Заполните обязательные поля",
        description: "Укажите имя и контакт для связи",
        variant: "destructive",
      });
      setCurrentStep(0);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-telegram", {
        body: formData,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "🎉 Заявка отправлена!",
        description: "Мы свяжемся с вами в течение 15 минут",
      });

      setTimeout(() => {
        setIsSuccess(false);
        setCurrentStep(0);
        setFormData({
          name: "",
          contact: "",
          subject: "",
          workType: "",
          deadline: "",
          message: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Ошибка отправки",
        description: "Попробуйте ещё раз или напишите нам в Telegram",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return formData.name.length > 0 && formData.contact.length > 0;
    }
    return true;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Быстрая заявка
          </motion.div>
          <h3 className="text-2xl font-bold text-foreground">
            Оставить заявку
          </h3>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 mb-8">
          {formSteps.map((step, index) => (
            <motion.button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <step.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{step.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h4 className="text-xl font-bold text-foreground mb-2">
                Заявка отправлена!
              </h4>
              <p className="text-muted-foreground">
                Ожидайте ответа в ближайшее время
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {currentStep === 0 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Ваше имя *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Как к вам обращаться?"
                      className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Телефон или Telegram *
                    </label>
                    <Input
                      value={formData.contact}
                      onChange={(e) => updateField("contact", e.target.value)}
                      placeholder="+7 (999) 123-45-67 или @username"
                      className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Тип работы
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Курсовая", "Дипломная", "Реферат", "Контрольная", "Эссе", "Другое"].map((type) => (
                        <motion.button
                          key={type}
                          type="button"
                          onClick={() => updateField("workType", type)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            formData.workType === type
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80 text-foreground"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {type}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Тема работы
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                      placeholder="Например: Маркетинговый анализ"
                      className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Срок сдачи
                    </label>
                    <Input
                      value={formData.deadline}
                      onChange={(e) => updateField("deadline", e.target.value)}
                      placeholder="Когда нужна работа?"
                      className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Описание задания
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder="Расскажите подробнее о вашей работе: требования, объём, особые пожелания..."
                    className="min-h-[180px] resize-none bg-background/50 border-border/50 focus:border-primary transition-colors"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {!isSuccess && (
          <div className="flex gap-3 mt-8">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1"
              >
                Назад
              </Button>
            )}
            {currentStep < formSteps.length - 1 ? (
              <Button
                variant="hero"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1"
              >
                Далее
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    Отправить заявку
                    <Send className="w-5 h-5" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-6">
          Нажимая кнопку, вы соглашаетесь с{" "}
          <a href="/privacy" className="text-primary hover:underline">
            политикой конфиденциальности
          </a>
        </p>
      </div>
    </div>
  );
};

export default ModernContactForm;
