import { Button } from "@/components/ui/button";
import { Gift, Users, ArrowRight } from "lucide-react";

const ReferralSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-12 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 border-2 border-primary-foreground rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-primary-foreground rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-20 h-20 border-2 border-primary-foreground rounded-full" />
          </div>

          <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 rounded-full text-primary-foreground font-medium text-sm mb-6">
                <Gift className="w-4 h-4" />
                Реферальная программа
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                Приводи друзей — получай скидки
              </h2>
              
              <p className="text-lg text-primary-foreground/80 mb-8">
                Поделись своей реферальной ссылкой с друзьями. Они получат скидку 10% 
                на первый заказ, а ты — бонусы на следующие работы!
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="glass" 
                  size="lg" 
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Получить ссылку
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Узнать подробнее
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-foreground mb-2">10%</div>
                <div className="text-primary-foreground/80">скидка другу</div>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-foreground mb-2">500₽</div>
                <div className="text-primary-foreground/80">бонус вам</div>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center col-span-2">
                <div className="flex items-center justify-center gap-2 text-primary-foreground mb-2">
                  <Users className="w-6 h-6" />
                  <span className="text-2xl font-bold">∞</span>
                </div>
                <div className="text-primary-foreground/80">без ограничений по приглашениям</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralSection;
