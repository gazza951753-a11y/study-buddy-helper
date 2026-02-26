import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import USPSection from "@/components/USPSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ReviewsSection from "@/components/ReviewsSection";
import FAQSection from "@/components/FAQSection";
import ReferralSection from "@/components/ReferralSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const StickySection = ({ 
  children, 
  index,
  bgClass = "bg-background"
}: { 
  children: React.ReactNode; 
  index: number;
  bgClass?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.92, 1, 1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [80, 0, 0, -80]);

  return (
    <div 
      ref={ref} 
      className={`min-h-screen sticky top-0 ${bgClass} overflow-hidden`}
      style={{ zIndex: 10 + index }}
    >
      <motion.div 
        className="min-h-screen"
        style={{ opacity, scale, y }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const Index = () => {
  return (
    <>
      <Helmet>
        <title>StudyAssist — Помощь студентам с учебными работами | Курсовые, дипломы, рефераты</title>
        <meta
          name="description"
          content="Профессиональная помощь студентам с курсовыми, дипломными работами, рефератами и контрольными. Гарантия уникальности от 70%, точные сроки, бесплатные доработки. studyassist.ru"
        />
        <meta name="keywords" content="помощь студентам, курсовая работа, дипломная работа, реферат, контрольная, заказать курсовую, studyassist" />
        <link rel="canonical" href="https://studyassist.ru" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Hero - stays at top */}
          <div className="relative z-0">
            <HeroSection />
          </div>

          {/* Sticky sections with parallax effect */}
          <div className="relative">
            <StickySection index={1} bgClass="bg-card">
              <USPSection />
            </StickySection>

            <StickySection index={2} bgClass="bg-background">
              <HowItWorksSection />
            </StickySection>

            <StickySection index={3} bgClass="bg-card">
              <ReviewsSection />
            </StickySection>

            <StickySection index={4} bgClass="bg-background">
              <FAQSection />
            </StickySection>

            <StickySection index={5} bgClass="bg-card">
              <ReferralSection />
            </StickySection>

            <StickySection index={6} bgClass="bg-background">
              <ContactSection />
            </StickySection>
          </div>

          {/* Footer stays at bottom */}
          <div className="relative z-20">
            <Footer />
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
