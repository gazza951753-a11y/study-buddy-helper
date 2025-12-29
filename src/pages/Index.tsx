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

const Index = () => {
  return (
    <>
      <Helmet>
        <title>EduHelp — Помощь студентам с учебными работами | Курсовые, дипломы, рефераты</title>
        <meta 
          name="description" 
          content="Профессиональная помощь студентам с курсовыми, дипломными работами, рефератами и другими заданиями. Гарантия качества, точные сроки, бесплатные доработки." 
        />
        <meta name="keywords" content="курсовая работа, дипломная работа, реферат, контрольная, помощь студентам, заказать курсовую" />
        <link rel="canonical" href="https://eduhelp.ru" />
      </Helmet>
      
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
    </>
  );
};

export default Index;
