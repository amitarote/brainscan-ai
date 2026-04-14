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
                <Label htmlFor="age">Age *</Label>
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
                <Label>Gender *</Label>
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
                <Label>Country *</Label>
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
                <Label>Genetic Risk Score</Label>
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
                <Label>Smoking History</Label>
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
                <Label>Alcohol Consumption</Label>
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
                <Label>Radiation Exposure</Label>
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
                <Label>Head Injury History</Label>
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
                <Label>Chronic Illness</Label>
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
