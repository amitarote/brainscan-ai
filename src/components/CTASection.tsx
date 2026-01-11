import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Phone } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Patient Care?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join leading healthcare institutions using NeuroScan AI to improve 
            early detection rates and patient outcomes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="gap-2">
              Request a Demo
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Download Whitepaper
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8 border-t border-border">
            <a 
              href="mailto:contact@neuroscan-ai.com" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span>contact@neuroscan-ai.com</span>
            </a>
            <a 
              href="tel:+1-800-NEURO-AI" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span>1-800-NEURO-AI</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
