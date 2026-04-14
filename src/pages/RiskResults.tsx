import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Activity,
  HeartPulse,
  Dna,
  TrendingUp,
  FileText,
  RotateCcw,
} from "lucide-react";

interface FormData {
  age: string;
  gender: string;
  country: string;
  genetic_risk: number[];
  smoking_history: string;
  alcohol_consumption: string;
  radiation_exposure: string;
  head_injury_history: string;
  chronic_illness: string;
  blood_pressure: string;
  diabetes: string;
  family_history: string;
  symptom_severity: number[];
}

// Mock risk scoring based on form inputs
const calculateMockRisk = (data: FormData) => {
  let score = 15; // base

  const age = parseInt(data.age) || 0;
  if (age > 60) score += 18;
  else if (age > 45) score += 12;
  else if (age > 30) score += 5;

  score += (data.genetic_risk[0] / 100) * 20;
  if (data.smoking_history === "yes") score += 8;
  if (data.alcohol_consumption === "heavy") score += 7;
  else if (data.alcohol_consumption === "moderate") score += 4;
  if (data.radiation_exposure === "yes") score += 10;
  if (data.head_injury_history === "yes") score += 6;
  if (data.chronic_illness === "yes") score += 5;
  if (data.blood_pressure === "high") score += 6;
  if (data.diabetes === "yes") score += 4;
  if (data.family_history === "yes") score += 12;
  score += (data.symptom_severity[0] / 10) * 10;

  return Math.min(Math.round(score), 100);
};

const getRiskLevel = (score: number) => {
  if (score < 25) return { label: "Low Risk", color: "text-green-500", bg: "bg-green-500", desc: "No significant risk factors detected. Continue regular health screenings." };
  if (score < 50) return { label: "Moderate Risk", color: "text-yellow-500", bg: "bg-yellow-500", desc: "Some risk factors present. Consider scheduling a consultation with a neurologist." };
  if (score < 75) return { label: "High Risk", color: "text-orange-500", bg: "bg-orange-500", desc: "Multiple risk factors detected. We recommend an MRI scan and specialist consultation." };
  return { label: "Critical Risk", color: "text-red-500", bg: "bg-red-500", desc: "Significant risk factors identified. Immediate specialist consultation strongly recommended." };
};

const GaugeChart = ({ score, animatedScore }: { score: number; animatedScore: number }) => {
  const risk = getRiskLevel(score);
  const angle = (animatedScore / 100) * 180;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-36 overflow-hidden">
        {/* Background arc */}
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(142, 71%, 45%)" />
              <stop offset="33%" stopColor="hsl(48, 96%, 53%)" />
              <stop offset="66%" stopColor="hsl(25, 95%, 53%)" />
              <stop offset="100%" stopColor="hsl(0, 84%, 60%)" />
            </linearGradient>
          </defs>
          {/* Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(animatedScore / 100) * 251.2} 251.2`}
            className="transition-all duration-1000 ease-out"
          />
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2={100 + 65 * Math.cos(((180 - angle) * Math.PI) / 180)}
            y2={100 - 65 * Math.sin(((180 - angle) * Math.PI) / 180)}
            stroke="hsl(var(--foreground))"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <circle cx="100" cy="100" r="5" fill="hsl(var(--foreground))" />
        </svg>
      </div>
      <div className="text-center -mt-2">
        <span className={`text-5xl font-bold ${risk.color}`}>{animatedScore}</span>
        <span className="text-xl text-muted-foreground">/100</span>
      </div>
      <span className={`text-lg font-semibold mt-2 ${risk.color}`}>{risk.label}</span>
    </div>
  );
};

const RiskResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as FormData | undefined;
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const score = formData ? calculateMockRisk(formData) : 0;
  const risk = getRiskLevel(score);

  useEffect(() => {
    if (!formData) return;
    // Animate score
    let current = 0;
    const step = Math.max(1, Math.floor(score / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
        setTimeout(() => setShowDetails(true), 300);
      }
      setAnimatedScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [score, formData]);

  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>No Assessment Data</CardTitle>
            <CardDescription>Please complete the risk assessment form first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/risk-assessment">
              <Button className="w-full">Go to Risk Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const factors = [
    { label: "Genetic Risk", value: `${formData.genetic_risk[0]}%`, icon: Dna, impact: formData.genetic_risk[0] > 50 ? "high" : formData.genetic_risk[0] > 25 ? "moderate" : "low" },
    { label: "Family History", value: formData.family_history === "yes" ? "Positive" : "Negative", icon: HeartPulse, impact: formData.family_history === "yes" ? "high" : "low" },
    { label: "Radiation Exposure", value: formData.radiation_exposure === "yes" ? "Yes" : "No", icon: Activity, impact: formData.radiation_exposure === "yes" ? "high" : "low" },
    { label: "Symptom Severity", value: `${formData.symptom_severity[0]}/10`, icon: TrendingUp, impact: formData.symptom_severity[0] > 7 ? "high" : formData.symptom_severity[0] > 4 ? "moderate" : "low" },
    { label: "Smoking History", value: formData.smoking_history === "yes" ? "Yes" : "No", icon: Activity, impact: formData.smoking_history === "yes" ? "moderate" : "low" },
    { label: "Blood Pressure", value: formData.blood_pressure || "Not specified", icon: HeartPulse, impact: formData.blood_pressure === "high" ? "moderate" : "low" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link to="/risk-assessment" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Assessment
          </Link>
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Risk Prediction Results</h1>
              <p className="text-muted-foreground">Powered by Dual-Stage Neural Network Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Disclaimer */}
        <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50 border border-accent">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            This is a simulated prediction using mock scoring. In production, this would use the trained ML models (brain_tumor_model.pkl, scaler.pkl, encoders.pkl) via a Python backend API.
          </p>
        </div>

        {/* Main Score Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-secondary to-secondary/50 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <GaugeChart score={score} animatedScore={animatedScore} />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-semibold text-foreground mb-2">Overall Risk Assessment</h2>
                <p className="text-muted-foreground mb-4">{risk.desc}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 inline mr-1.5" />
                    Stage 1: Risk Prediction
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-muted border border-border text-sm text-muted-foreground">
                    <Brain className="h-3.5 w-3.5 inline mr-1.5" />
                    Stage 2: Tumor Detection (Requires MRI)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Risk Factor Breakdown */}
        <div className={`transition-all duration-500 ${showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Risk Factor Breakdown
              </CardTitle>
              <CardDescription>Individual factor analysis from the AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {factors.map((f) => (
                  <div key={f.label} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                    <div className={`p-2 rounded-lg ${f.impact === "high" ? "bg-red-500/10" : f.impact === "moderate" ? "bg-yellow-500/10" : "bg-green-500/10"}`}>
                      <f.icon className={`h-4 w-4 ${f.impact === "high" ? "text-red-500" : f.impact === "moderate" ? "text-yellow-500" : "text-green-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-sm text-muted-foreground">{f.value}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      f.impact === "high" ? "bg-red-500/10 text-red-500" :
                      f.impact === "moderate" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-green-500/10 text-green-500"
                    }`}>
                      {f.impact}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Info */}
        <div className={`transition-all duration-500 delay-200 ${showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Model Pipeline
              </CardTitle>
              <CardDescription>Models used in prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { name: "encoders.pkl", desc: "Categorical feature encoder", detail: "Label/One-Hot encoding for Gender, Country, etc." },
                  { name: "scaler.pkl", desc: "Feature normalizer", detail: "StandardScaler for numerical inputs (Age, Genetic Risk, etc.)" },
                  { name: "brain_tumor_model.pkl", desc: "Risk classifier", detail: "Trained ML model for brain cancer risk prediction" },
                ].map((m) => (
                  <div key={m.name} className="p-4 rounded-lg border border-border bg-secondary/30">
                    <code className="text-xs font-mono text-primary">{m.name}</code>
                    <p className="text-sm font-medium text-foreground mt-1">{m.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-accent/30 border border-accent">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> To use the actual ML models, deploy a Python backend (Flask/FastAPI) that loads these .pkl files and exposes a /predict endpoint. The frontend would send the form data to this API and display the real prediction here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confidence Metrics */}
        <div className={`transition-all duration-500 delay-300 ${showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Card>
            <CardHeader>
              <CardTitle>Confidence Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Model Confidence", value: Math.min(95, 70 + Math.random() * 25) },
                { label: "Data Completeness", value: Object.values(formData).filter((v) => v && (typeof v === "string" ? v.length > 0 : true)).length / 13 * 100 },
                { label: "Feature Correlation", value: Math.min(98, 60 + Math.random() * 30) },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{m.label}</span>
                    <span className="text-muted-foreground">{Math.round(m.value)}%</span>
                  </div>
                  <Progress value={m.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate("/risk-assessment")} variant="outline" className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" />
            New Assessment
          </Button>
          <Link to="/" className="flex-1">
            <Button className="w-full">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RiskResults;
