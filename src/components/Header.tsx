"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, User, Clock, Gift } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

// ── Countdown logic (shared localStorage key with ReferralSection) ──
const PROMO_KEY = "referral_promo_expiry";
function getOrCreateExpiry(): number {
  const stored = localStorage.getItem(PROMO_KEY);
  if (stored) {
    const v = parseInt(stored, 10);
    if (v > Date.now()) return v;
  }
  const hours = 12 + Math.floor(Math.random() * 5);
  const minutes = Math.floor(Math.random() * 60);
  const expiry = Date.now() + (hours * 60 + minutes) * 60 * 1000;
  localStorage.setItem(PROMO_KEY, String(expiry));
  return expiry;
}

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Countdown timer
  useEffect(() => {
    let expiry = getOrCreateExpiry();
    const pad = (n: number) => n;
    const tick = () => {
      const rem = expiry - Date.now();
      if (rem <= 0) {
        const h = 12 + Math.floor(Math.random() * 5);
        const m = Math.floor(Math.random() * 60);
        expiry = Date.now() + (h * 60 + m) * 60 * 1000;
        localStorage.setItem(PROMO_KEY, String(expiry));
      }
      const totalSec = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft({
        h: Math.floor(totalSec / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const p = (n: number) => String(n).padStart(2, "0");

  const navItems = [
    { label: "Услуги", href: "#services" },
    { label: "Как это работает", href: "#how-it-works" },
    { label: "Отзывы", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
    { label: "Контакты", href: "#contacts" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* ── Promo Banner ── */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 py-2 text-sm font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline font-bold">Акция «Приведи друга»:</span>
              <span className="sm:hidden font-bold">Акция:</span>
              скидка 10% другу + <span className="font-bold">500 ₽</span> вам
            </span>
            <span className="hidden sm:inline text-white/60">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0 text-yellow-200" />
              <span className="text-yellow-100">До конца акции:</span>
              <span className="font-bold tabular-nums text-white bg-black/20 px-2 py-0.5 rounded-md text-base">
                {p(timeLeft.h)}:{p(timeLeft.m)}:{p(timeLeft.s)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Study<span className="text-primary">Assist</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors font-medium text-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
                <User className="w-4 h-4 mr-2" />
                Кабинет
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => router.push("/auth")}>
                Войти
              </Button>
            )}
            <Button variant="cta" size="sm">
              Заказать работу
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4 px-4">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
                    <User className="w-4 h-4 mr-2" />
                    Личный кабинет
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => router.push("/auth")}>
                    Войти
                  </Button>
                )}
                <Button variant="cta" className="w-full">
                  Заказать работу
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
