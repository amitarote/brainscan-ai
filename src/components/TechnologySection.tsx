import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Detection Accuracy", value: 98.5, suffix: "%" },
  { label: "Risk Prediction Rate", value: 96.2, suffix: "%" },
  { label: "Processing Speed", value: 4.5, suffix: " min" },
  { label: "False Positive Reduction", value: 87, suffix: "%" },
];

const technologies = [
  "Convolutional Neural Networks (CNN)",
  "Transfer Learning",
  "Image Segmentation",
  "Ensemble Methods",
  "Natural Language Processing",
  "Federated Learning",
];

const TechnologySection = () => {
  return (
    <section id="technology" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-secondary-foreground/80 mb-8">
              Our system leverages the latest advancements in artificial intelligence 
              and machine learning, trained on extensive datasets from leading medical institutions.
            </p>

            <div className="space-y-6">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-secondary-foreground">{stat.label}</span>
                    <span className="font-bold text-primary">{stat.value}{stat.suffix}</span>
                  </div>
                  <Progress value={stat.value} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary-foreground/5 rounded-2xl p-8 border border-secondary-foreground/10">
            <h3 className="text-xl font-bold text-secondary-foreground mb-6">
              Core Technologies
            </h3>
            <div className="flex flex-wrap gap-3">
              {technologies.map((tech, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 rounded-full bg-primary/20 text-primary-foreground border border-primary/30 text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-xl bg-secondary-foreground/10">
              <h4 className="font-semibold text-secondary-foreground mb-2">
                Training Dataset
              </h4>
              <p className="text-secondary-foreground/70 text-sm">
                Over 500,000+ annotated MRI scans from 120+ medical institutions worldwide, 
                continuously updated with new validated cases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
