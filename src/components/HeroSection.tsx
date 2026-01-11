import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import heroBrainScan from "@/assets/hero-brain-scan.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBrainScan}
          alt="AI Brain Scan Visualization"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-sm font-medium text-primary-foreground">AI-Powered Diagnostics</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground leading-tight mb-6">
            Dual-Stage AI System for{" "}
            <span className="text-primary">Brain Cancer</span>{" "}
            Detection
          </h1>

          <p className="text-lg md:text-xl text-secondary-foreground/80 mb-8 max-w-2xl">
            Revolutionary healthcare technology combining risk prediction and tumor detection 
            for early, accurate brain cancer diagnosis. Empowering clinicians with AI-driven insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="gap-2">
              Start Risk Assessment
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/20">
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-secondary-foreground/90">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <span className="text-secondary-foreground/90">98.5% Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
