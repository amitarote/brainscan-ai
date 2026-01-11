import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Activity, FileSearch, Users, Clock, Lock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Neural Network Analysis",
    description: "Advanced deep learning algorithms analyze MRI scans with unprecedented precision and detail.",
  },
  {
    icon: Activity,
    title: "Real-Time Risk Assessment",
    description: "Instant risk prediction based on patient history, symptoms, and genetic markers.",
  },
  {
    icon: FileSearch,
    title: "Tumor Detection",
    description: "Precise tumor localization and characterization using state-of-the-art image segmentation.",
  },
  {
    icon: Users,
    title: "Clinical Integration",
    description: "Seamlessly integrates with existing hospital systems and electronic health records.",
  },
  {
    icon: Clock,
    title: "Rapid Results",
    description: "Get comprehensive analysis results in under 5 minutes, accelerating clinical decisions.",
  },
  {
    icon: Lock,
    title: "Secure & Compliant",
    description: "End-to-end encryption with full HIPAA compliance for patient data protection.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
            Powerful Features for Better Outcomes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our dual-stage AI system combines cutting-edge technology with clinical expertise 
            to deliver accurate, actionable insights for brain cancer detection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border bg-background hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
