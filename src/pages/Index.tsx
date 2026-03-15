"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import USPSection from "@/components/USPSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ReviewsSection from "@/components/ReviewsSection";
import FAQSection from "@/components/FAQSection";
import ReferralSection from "@/components/ReferralSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <USPSection />
        <HowItWorksSection />
        <ReviewsSection />
        <FAQSection />
        <ReferralSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
