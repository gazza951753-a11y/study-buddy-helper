import { Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const reviews = [
  {
    name: "Анна М.",
    avatar: "А",
    role: "Студентка, Экономика",
    rating: 5,
    text: "Заказывала курсовую по микроэкономике. Сделали за неделю, преподаватель даже похвалил за качество анализа. Очень довольна!",
    date: "2 недели назад",
  },
  {
    name: "Дмитрий К.",
    avatar: "Д",
    role: "Студент, Юриспруденция",
    rating: 5,
    text: "Срочно нужен был диплом, оставалось 2 недели до защиты. Ребята справились, защитился на отлично. Рекомендую!",
    date: "1 месяц назад",
  },
  {
    name: "Елена С.",
    avatar: "Е",
    role: "Магистрант, Психология",
    rating: 5,
    text: "Уже третий раз обращаюсь за помощью. Всегда качественно, в срок, учитывают все пожелания. Спасибо за накопительную скидку!",
    date: "3 недели назад",
  },
];

const ReviewsSection = () => {
  return (
    <section id="reviews" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            Отзывы студентов
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Что говорят о нас
          </h2>
          <p className="text-lg text-muted-foreground">
            Более 5000 студентов уже воспользовались нашими услугами
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {reviews.map((review, index) => (
            <div
              key={review.name}
              className="bg-card rounded-2xl p-6 sm:p-8 border border-border hover:shadow-elegant transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-primary/20 mb-4" />

              {/* Review Text */}
              <p className="text-foreground leading-relaxed mb-6">
                "{review.text}"
              </p>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-accent fill-accent"
                  />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {review.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{review.name}</div>
                  <div className="text-sm text-muted-foreground">{review.role}</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-4">
                {review.date}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Читать все отзывы
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
