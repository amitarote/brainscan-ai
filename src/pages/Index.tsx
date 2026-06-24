import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TechnologySection from "@/components/TechnologySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="OncoVision AI — AI-Powered Brain Cancer Detection"
        description="Dual-stage AI platform that combines risk prediction with MRI tumor detection to support faster, more accurate brain cancer diagnostics."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: "OncoVision AI",
          url: "https://brain-tumor-ai.lovable.app/",
          description: "Dual-stage AI for brain cancer risk assessment and MRI tumor detection.",
          about: { "@type": "MedicalCondition", name: "Brain cancer" },
        }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TechnologySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

