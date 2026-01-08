import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator as CalcIcon, ArrowRight } from "lucide-react";

const workTypes = [
  { value: "essay", label: "Реферат", basePrice: 800 },
  { value: "coursework", label: "Курсовая работа", basePrice: 3500 },
  { value: "diploma", label: "Дипломная работа", basePrice: 15000 },
  { value: "control", label: "Контрольная работа", basePrice: 600 },
  { value: "practice", label: "Отчёт по практике", basePrice: 2000 },
  { value: "presentation", label: "Презентация", basePrice: 500 },
  { value: "test", label: "Тест/Экзамен", basePrice: 1000 },
];

const subjects = [
  { value: "law", label: "Юриспруденция", modifier: 1.2 },
  { value: "economics", label: "Экономика", modifier: 1.1 },
  { value: "management", label: "Менеджмент", modifier: 1.0 },
  { value: "psychology", label: "Психология", modifier: 1.0 },
  { value: "pedagogy", label: "Педагогика", modifier: 0.95 },
  { value: "marketing", label: "Маркетинг", modifier: 1.1 },
  { value: "it", label: "Информатика/IT", modifier: 1.3 },
  { value: "medicine", label: "Медицина", modifier: 1.4 },
  { value: "history", label: "История", modifier: 0.9 },
  { value: "other", label: "Другое", modifier: 1.0 },
];

const deadlines = [
  { value: "1", label: "1 день", modifier: 2.0 },
  { value: "3", label: "3 дня", modifier: 1.5 },
  { value: "7", label: "1 неделя", modifier: 1.2 },
  { value: "14", label: "2 недели", modifier: 1.0 },
  { value: "30", label: "1 месяц", modifier: 0.9 },
];

const Calculator = () => {
  const navigate = useNavigate();
  const [workType, setWorkType] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const price = useMemo(() => {
    if (!workType || !subject || !deadline) return null;

    const work = workTypes.find((w) => w.value === workType);
    const subj = subjects.find((s) => s.value === subject);
    const dead = deadlines.find((d) => d.value === deadline);

    if (!work || !subj || !dead) return null;

    return Math.round(work.basePrice * subj.modifier * dead.modifier);
  }, [workType, subject, deadline]);

  return (
    <div className="bg-card rounded-2xl shadow-elegant border border-border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
          <CalcIcon className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Калькулятор стоимости</h3>
          <p className="text-sm text-muted-foreground">Узнайте цену за 30 секунд</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Тип работы
          </label>
          <Select value={workType} onValueChange={setWorkType}>
            <SelectTrigger className="h-12 bg-background">
              <SelectValue placeholder="Выберите тип работы" />
            </SelectTrigger>
            <SelectContent>
              {workTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Предмет
          </label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="h-12 bg-background">
              <SelectValue placeholder="Выберите предмет" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subj) => (
                <SelectItem key={subj.value} value={subj.value}>
                  {subj.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Срок выполнения
          </label>
          <Select value={deadline} onValueChange={setDeadline}>
            <SelectTrigger className="h-12 bg-background">
              <SelectValue placeholder="Выберите срок" />
            </SelectTrigger>
            <SelectContent>
              {deadlines.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price Display */}
      <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Стоимость:</span>
          <div className="text-right">
            {price ? (
              <>
                <span className="text-3xl font-bold text-primary">от {price.toLocaleString()} ₽</span>
                <p className="text-xs text-muted-foreground mt-1">Точная цена после консультации</p>
              </>
            ) : (
              <span className="text-lg text-muted-foreground">Заполните все поля</span>
            )}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <Button 
        variant="hero" 
        size="lg" 
        className="w-full mt-6"
        onClick={() => {
          const params = new URLSearchParams();
          if (workType) params.set("type", workType);
          if (subject) params.set("subject", subject);
          if (deadline) params.set("deadline", deadline);
          navigate(`/payment?${params.toString()}`);
        }}
      >
        Оформить заказ
        <ArrowRight className="w-5 h-5" />
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Предоплата через ЮKassa • СБП
      </p>
    </div>
  );
};

export default Calculator;
