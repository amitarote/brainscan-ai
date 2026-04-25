import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Brain, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import InfoTip from "@/components/InfoTip";

// Tooltip copy: explains why each factor matters for the Stage 1 risk score.
const TIPS = {
  age: {
    why: "Brain tumor incidence rises with age, especially after 45. Younger patients have different tumor profiles.",
    indicates: "Higher age (>45) adds weight to the Stage 1 score; >60 contributes the maximum age-related signal.",
  },
  gender: {
    why: "Some tumor types (e.g. meningiomas) are more common in women, while gliomas are slightly more common in men.",
    indicates: "Used by the model to calibrate baseline probability; not a direct positive/negative signal.",
  },
  country: {
    why: "Regional differences in environmental exposure, screening access, and reporting affect baseline risk.",
    indicates: "Helps the model adjust for population-level prevalence; not a direct risk multiplier.",
  },
  genetic_risk: {
    why: "Inherited mutations (NF1, NF2, Li-Fraumeni, Turcot) significantly raise brain tumor risk.",
    indicates: "Scores >50% materially raise the Stage 1 result; >75% is treated as a strong contributing factor.",
  },
  smoking: {
    why: "Smoking is linked to several cancers and may modestly elevate brain tumor risk through systemic effects.",
    indicates: "A 'Yes' adds a moderate weight to the Stage 1 score.",
  },
  alcohol: {
    why: "Heavy alcohol use is associated with increased general cancer risk and may compound other factors.",
    indicates: "'Heavy' contributes more than 'Moderate'; 'None' or 'Light' add no weight.",
  },
  radiation: {
    why: "Prior ionizing radiation to the head (e.g. childhood radiotherapy) is one of the few well-established environmental causes of brain tumors.",
    indicates: "A 'Yes' is a strong contributor to the Stage 1 score.",
  },
  head_injury: {
    why: "Severe or repeated head trauma has been weakly associated with later tumor development in some studies.",
    indicates: "A 'Yes' adds a small contribution to the Stage 1 score.",
  },
  chronic_illness: {
    why: "Chronic conditions can affect immune surveillance and overall cancer susceptibility.",
    indicates: "A 'Yes' adds a small contribution to the Stage 1 score.",
  },
  blood_pressure: {
    why: "Hypertension is correlated with vascular changes that some studies link to glioma risk.",
    indicates: "'High' adds a moderate contribution; 'Normal' or 'Low' add none.",
  },
  diabetes: {
    why: "Diabetes affects metabolism and inflammation, which may interact with tumor biology.",
    indicates: "A 'Yes' adds a small contribution to the Stage 1 score.",
  },
  family_history: {
    why: "A first-degree relative with brain or other cancers can indicate inherited susceptibility.",
    indicates: "A 'Yes' is one of the strongest non-genetic-test contributors to the Stage 1 score.",
  },
  symptom_severity: {
    why: "Persistent headaches, seizures, vision changes, or cognitive issues can be early warning signs.",
    indicates: "Severity >7/10 substantially raises the Stage 1 score; mild symptoms add little.",
  },
} as const;

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "India",
  "Germany", "France", "Brazil", "China", "Japan", "South Korea",
  "Nigeria", "South Africa", "Mexico", "Italy", "Spain", "Other"
];

const RiskAssessment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    country: "",
    genetic_risk: [50],
    smoking_history: "",
    alcohol_consumption: "",
    radiation_exposure: "",
    head_injury_history: "",
    chronic_illness: "",
    blood_pressure: "",
    diabetes: "",
    family_history: "",
    symptom_severity: [5],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.age || !formData.gender || !formData.country) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    navigate("/risk-results", { state: { formData } });
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Brain Cancer Risk Assessment</h1>
              <p className="text-muted-foreground">Fill in patient details for AI-powered risk prediction</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50 border border-accent mb-8">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            This tool is for research and screening purposes only. It does not replace professional medical diagnosis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
              <CardDescription>Basic patient information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="age">Age *</Label>
                  <InfoTip {...TIPS.age} label="Why we ask about age" />
                </div>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="120"
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Gender *</Label>
                  <InfoTip {...TIPS.gender} label="Why we ask about gender" />
                </div>
                <Select onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center gap-1.5">
                  <Label>Country *</Label>
                  <InfoTip {...TIPS.country} label="Why we ask about country" />
                </div>
                <Select onValueChange={(v) => setFormData({ ...formData, country: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase().replace(/\s+/g, "_")}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Factors</CardTitle>
              <CardDescription>Lifestyle and exposure history</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Genetic Risk Score</Label>
                  <InfoTip {...TIPS.genetic_risk} label="Why we ask about genetic risk" />
                </div>
                <div className="pt-2">
                  <Slider
                    value={formData.genetic_risk}
                    onValueChange={(v) => setFormData({ ...formData, genetic_risk: v })}
                    max={100}
                    step={1}
                  />
                  <span className="text-sm text-muted-foreground mt-1 block">{formData.genetic_risk[0]}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Smoking History</Label>
                  <InfoTip {...TIPS.smoking} label="Why we ask about smoking" />
                </div>
                <RadioGroup
                  onValueChange={(v) => setFormData({ ...formData, smoking_history: v })}
                  className="flex gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="smoke-yes" />
                    <Label htmlFor="smoke-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="smoke-no" />
                    <Label htmlFor="smoke-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Alcohol Consumption</Label>
                  <InfoTip {...TIPS.alcohol} label="Why we ask about alcohol" />
                </div>
                <Select onValueChange={(v) => setFormData({ ...formData, alcohol_consumption: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Radiation Exposure</Label>
                  <InfoTip {...TIPS.radiation} label="Why we ask about radiation exposure" />
                </div>
                <RadioGroup
                  onValueChange={(v) => setFormData({ ...formData, radiation_exposure: v })}
                  className="flex gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="rad-yes" />
                    <Label htmlFor="rad-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="rad-no" />
                    <Label htmlFor="rad-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Head Injury History</Label>
                  <InfoTip {...TIPS.head_injury} label="Why we ask about head injury" />
                </div>
                <RadioGroup
                  onValueChange={(v) => setFormData({ ...formData, head_injury_history: v })}
                  className="flex gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="head-yes" />
                    <Label htmlFor="head-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="head-no" />
                    <Label htmlFor="head-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Chronic Illness</Label>
                  <InfoTip {...TIPS.chronic_illness} label="Why we ask about chronic illness" />
                </div>
                <RadioGroup
                  onValueChange={(v) => setFormData({ ...formData, chronic_illness: v })}
                  className="flex gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="chronic-yes" />
                    <Label htmlFor="chronic-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="chronic-no" />
                    <Label htmlFor="chronic-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Existing conditions and family background</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Blood Pressure</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, blood_pressure: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Diabetes</Label>
                <RadioGroup
                  onValueChange={(v) => setFormData({ ...formData, diabetes: v })}
                  className="flex gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="diabetes-yes" />
                    <Label htmlFor="diabetes-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="diabetes-no" />
                    <Label htmlFor="diabetes-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Family History of Cancer</Label>
                <RadioGroup
                  onValueChange={(v) => setFormData({ ...formData, family_history: v })}
                  className="flex gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="family-yes" />
                    <Label htmlFor="family-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="family-no" />
                    <Label htmlFor="family-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Symptom Severity (1-10)</Label>
                <div className="pt-2">
                  <Slider
                    value={formData.symptom_severity}
                    onValueChange={(v) => setFormData({ ...formData, symptom_severity: v })}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <span className="text-sm text-muted-foreground mt-1 block">{formData.symptom_severity[0]} / 10</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full">
            Submit Risk Assessment
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RiskAssessment;
