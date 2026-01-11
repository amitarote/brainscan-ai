import { ArrowDown } from "lucide-react";

const steps = [
  {
    stage: "Stage 1",
    title: "Risk Prediction",
    description: "Patient data including medical history, symptoms, and genetic factors are analyzed by our AI to calculate brain cancer risk probability.",
    features: ["Medical history analysis", "Symptom correlation", "Genetic marker screening", "Risk score generation"],
  },
  {
    stage: "Stage 2",
    title: "Tumor Detection",
    description: "For high-risk patients, MRI scans are processed through our advanced neural network for precise tumor detection and characterization.",
    features: ["MRI image processing", "Tumor localization", "Size & type classification", "Treatment recommendations"],
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Our Dual-Stage System Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive two-phase approach that first assesses risk, then provides 
            detailed tumor analysis for those who need it most.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index}>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">{step.stage}</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-6">{step.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {step.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex justify-center md:justify-start md:ml-12 my-8">
                  <ArrowDown className="h-8 w-8 text-primary animate-bounce" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
