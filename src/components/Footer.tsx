import { Brain } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-secondary border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-secondary-foreground">NeuroScan AI</span>
            </div>
            <p className="text-secondary-foreground/70 max-w-md">
              Advancing brain cancer detection through innovative AI technology. 
              Our mission is to improve patient outcomes through early, accurate diagnosis.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-secondary-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Features</a></li>
              <li><a href="#" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Technology</a></li>
              <li><a href="#" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Case Studies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-secondary-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center">
          <p className="text-secondary-foreground/60 text-sm">
            © 2026 NeuroScan AI. All rights reserved. FDA Cleared. HIPAA Compliant.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
