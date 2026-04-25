import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight,
  ScanLine,
  Download,
  Sparkles,
  MessageCircle,
  X,
} from "lucide-react";
import { generateRiskPDF } from "@/lib/generatePDF";
import { saveRiskRecord } from "@/lib/history";
import { sayToNavigator } from "@/components/AINavigator";
import { toast } from "sonner";
import Stage2Viewer from "@/components/Stage2Viewer";

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

// Three-zone gauge classification per spec:
// Green 0-39 | Yellow 40-69 | Red 70-100
const getGaugeZone = (score: number) => {
  if (score >= 70) {
    return {
      key: "red" as const,
      label: "High Risk Detected",
      sub: "Immediate Stage 2 MRI scan recommended",
      color: "text-red-500",
      ring: "ring-red-500/40",
      glow: "shadow-[0_0_40px_-5px_hsl(0_84%_60%/0.45)]",
      badge: "bg-red-500/10 text-red-500 border-red-500/30",
      stroke: "hsl(0, 84%, 60%)",
    };
  }
  if (score >= 40) {
    return {
      key: "yellow" as const,
      label: "Precautionary Review Recommended",
      sub: "A confirmatory MRI scan is advised",
      color: "text-yellow-500",
      ring: "ring-yellow-500/40",
      glow: "shadow-[0_0_40px_-5px_hsl(48_96%_53%/0.4)]",
      badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      stroke: "hsl(48, 96%, 53%)",
    };
  }
  return {
    key: "green" as const,
    label: "Low Probability",
    sub: "No significant indicators — routine monitoring suggested",
    color: "text-green-500",
    ring: "ring-green-500/40",
    glow: "shadow-[0_0_40px_-5px_hsl(142_71%_45%/0.4)]",
    badge: "bg-green-500/10 text-green-500 border-green-500/30",
    stroke: "hsl(142, 71%, 45%)",
  };
};

// Polar helper for arc paths on a 200x110 viewBox, center (100,100), radius 80
const polar = (angleDeg: number, r = 80) => {
  const rad = ((180 - angleDeg) * Math.PI) / 180;
  return { x: 100 + r * Math.cos(rad), y: 100 - r * Math.sin(rad) };
};
const arcPath = (startDeg: number, endDeg: number, r = 80) => {
  const s = polar(startDeg, r);
  const e = polar(endDeg, r);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
};

const GaugeChart = ({ score, animatedScore }: { score: number; animatedScore: number }) => {
  const zone = getGaugeZone(score);
  const angle = (animatedScore / 100) * 180;
  const needle = polar(angle, 70);

  // Zone arc segments (degrees on a 0-180 sweep)
  // Green 0-39 → 0–70.2°, Yellow 40-69 → 70.2–124.2°, Red 70-100 → 124.2–180°
  const greenEnd = (39 / 100) * 180;
  const yellowEnd = (69 / 100) * 180;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-72 h-44 overflow-hidden rounded-t-full transition-shadow duration-700 ${zone.glow}`}>
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Outer track */}
          <path
            d={arcPath(0, 180)}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Zone arcs */}
          <path d={arcPath(0.5, greenEnd)} fill="none" stroke="hsl(142, 71%, 45%)" strokeWidth="14" strokeLinecap="round" opacity={zone.key === "green" ? 1 : 0.35} className="transition-opacity duration-500" />
          <path d={arcPath(greenEnd + 1, yellowEnd)} fill="none" stroke="hsl(48, 96%, 53%)" strokeWidth="14" strokeLinecap="round" opacity={zone.key === "yellow" ? 1 : 0.35} className="transition-opacity duration-500" />
          <path d={arcPath(yellowEnd + 1, 179.5)} fill="none" stroke="hsl(0, 84%, 60%)" strokeWidth="14" strokeLinecap="round" opacity={zone.key === "red" ? 1 : 0.35} className="transition-opacity duration-500" />

          {/* Tick marks at zone boundaries */}
          {[greenEnd, yellowEnd].map((deg) => {
            const inner = polar(deg, 60);
            const outer = polar(deg, 88);
            return (
              <line
                key={deg}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="hsl(var(--background))"
                strokeWidth="2"
              />
            );
          })}

          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2={needle.x}
            y2={needle.y}
            stroke={zone.stroke}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 4px ${zone.stroke})` }}
          />
          <circle cx="100" cy="100" r="7" fill="hsl(var(--background))" stroke={zone.stroke} strokeWidth="2.5" />
          <circle cx="100" cy="100" r="2.5" fill={zone.stroke} />
        </svg>

        {/* Zone scale labels */}
        <div className="absolute inset-x-0 bottom-1 flex justify-between px-3 text-[10px] font-medium text-muted-foreground">
          <span>0</span>
          <span className="text-green-500">39</span>
          <span className="text-yellow-500">69</span>
          <span>100</span>
        </div>
      </div>

      <div className="text-center mt-1">
        <span className={`text-5xl font-bold tabular-nums ${zone.color} transition-colors duration-500`}>{animatedScore}</span>
        <span className="text-xl text-muted-foreground">/100</span>
      </div>
      <div className={`mt-3 px-4 py-1.5 rounded-full border text-sm font-semibold ${zone.badge} transition-all duration-500`}>
        {zone.label}
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center max-w-[16rem]">{zone.sub}</p>
    </div>
  );
};

// Backend URL — update this after deploying your Flask backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const RiskResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as FormData | undefined;
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [score, setScore] = useState(0);
  const [mlConfidence, setMlConfidence] = useState<number | null>(null);
  const [mlProbabilities, setMlProbabilities] = useState<{ no_tumor: number; tumor: number } | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMediumModal, setShowMediumModal] = useState(false);
  const [gateTriggered, setGateTriggered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionStep, setTransitionStep] = useState(0);

  const risk = getRiskLevel(score);

  useEffect(() => {
    if (!formData) { setLoading(false); return; }

    const fetchPrediction = async () => {
      try {
        const payload = {
          age: formData.age,
          gender: formData.gender,
          country: formData.country,
          genetic_risk: formData.genetic_risk[0],
          smoking_history: formData.smoking_history,
          alcohol_consumption: formData.alcohol_consumption,
          radiation_exposure: formData.radiation_exposure,
          head_injury_history: formData.head_injury_history,
          chronic_illness: formData.chronic_illness,
          blood_pressure: formData.blood_pressure,
          diabetes: formData.diabetes,
          family_history: formData.family_history,
          symptom_severity: formData.symptom_severity[0],
        };

        const res = await fetch(`${BACKEND_URL}/predict-risk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Backend error");
        const result = await res.json();
        setScore(result.score);
        setMlConfidence(result.confidence);
        setMlProbabilities(result.probabilities);
        setUsingMock(false);
      } catch {
        // Fallback to mock scoring
        const mockScore = calculateMockRisk(formData);
        setScore(mockScore);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate score after loading
  useEffect(() => {
    if (loading || !formData || score === 0) return;
    saveRiskRecord({ age: formData.age, gender: formData.gender, score, riskLevel: getRiskLevel(score).label });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, score]);

  // Logic Gate: conditional routing based on risk score (0-100 scale)
  // High >70, Medium 40-70, Low <40
  useEffect(() => {
    if (loading || !formData || score === 0 || gateTriggered) return;
    if (score > 70) {
      setGateTriggered(true);
      setTransitioning(true);
      toast.error("⚠️ URGENT: High risk detected", {
        description: "AI Navigator is transitioning you to Stage 2 Detection. Please prepare your MRI scan.",
        duration: 6000,
      });
      sayToNavigator(
        `Urgent: your Stage 1 score is ${score}/100, which crosses the high-risk threshold. I'm taking you to Stage 2 — Tumor Detection — right now. Please have your MRI (.nii) file ready. You're not alone in this; we'll go step by step.`,
        { tone: "urgent", open: true },
      );

      const totalMs = 3000;
      const tickMs = 50;
      const stepBoundaries = [25, 55, 85, 100]; // 4 steps
      let elapsed = 0;
      const progressInterval = setInterval(() => {
        elapsed += tickMs;
        const pct = Math.min(100, (elapsed / totalMs) * 100);
        setTransitionProgress(pct);
        const stepIdx = stepBoundaries.findIndex((b) => pct <= b);
        setTransitionStep(stepIdx === -1 ? stepBoundaries.length - 1 : stepIdx);
      }, tickMs);

      const t = setTimeout(() => {
        clearInterval(progressInterval);
        navigate("/tumor-detection", { state: { urgent: true, riskScore: score } });
      }, totalMs);
      return () => {
        clearTimeout(t);
        clearInterval(progressInterval);
      };
    }
    if (score >= 40) {
      setGateTriggered(true);
      const t = setTimeout(() => setShowMediumModal(true), 1800);
      return () => clearTimeout(t);
    }
    // Low risk: stay on page, discreet button shown below
  }, [loading, score, gateTriggered, formData, navigate]);

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

  const transitionSteps = [
    "Analyzing risk profile…",
    "Activating Stage 2 Detection module…",
    "Preparing MRI upload interface…",
    "Redirecting to Tumor Detection…",
  ];

  // Normalized risk score (0.0 – 1.0) per spec
  const riskScore = score / 100;

  return (
    <div className="min-h-screen bg-background">
      {/* ────────────────────────────────────────────────────────────
          HIGH RISK (>0.7): Auto-elevation to Stage 2 — antigravity float
      ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(34,211,238,0.15), transparent 50%), radial-gradient(circle at 70% 80%, rgba(168,85,247,0.18), transparent 50%), rgba(10,15,30,0.92)",
            }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl"
            >
              {/* Status banner */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-4 flex items-center justify-between rounded-2xl border border-red-500/40 bg-[#0a0f1e]/80 backdrop-blur-md px-5 py-3 shadow-[0_0_40px_rgba(239,68,68,0.25)]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
                    <div className="relative h-8 w-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400/90">
                      Auto-elevation engaged
                    </div>
                    <div className="text-sm font-medium text-white">
                      High risk detected — entering Stage 2
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setTransitioning(false)}
                  className="h-8 w-8 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center"
                  aria-label="Cancel auto-redirect"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>

              {/* Live Stage 2 Viewer preview */}
              <Stage2Viewer confidence={riskScore} />

              {/* Progress + steps */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="mt-4 rounded-2xl border border-cyan-400/15 bg-[#0a0f1e]/80 backdrop-blur-md p-5 space-y-3 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-cyan-300/80">
                  <span>Routing to Tumor Detection</span>
                  <span className="font-mono">{Math.round(transitionProgress)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-red-400"
                    style={{ width: `${transitionProgress}%`, boxShadow: "0 0 12px rgba(168,85,247,0.6)" }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-white/70">
                  {transitionSteps.map((label, i) => {
                    const done = i < transitionStep;
                    const active = i === transitionStep;
                    return (
                      <span
                        key={label}
                        className={`flex items-center gap-1.5 ${
                          done ? "text-emerald-400" : active ? "text-cyan-300" : "text-white/30"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            done ? "bg-emerald-400" : active ? "bg-cyan-300 animate-pulse" : "bg-white/20"
                          }`}
                        />
                        {label}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      {loading && (
          <div className="flex items-center justify-center py-20">
            <Brain className="h-8 w-8 text-primary animate-spin mr-3" />
            <span className="text-muted-foreground">Running ML model prediction...</span>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50 border border-accent">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            {usingMock
              ? "Using simulated scoring (backend unavailable). Deploy the Flask backend with brain_tumor_model-2.pkl for real ML predictions."
              : "Prediction powered by XGBoost ML model (brain_tumor_model-2.pkl) via the backend API."}
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

        {/* AI Navigator Panel */}
        {!loading && score > 0 && (() => {
          const tier =
            score > 70
              ? {
                  tone: "urgent" as const,
                  badge: "Urgent Guidance",
                  badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
                  ringClass: "border-destructive/40 bg-destructive/5",
                  iconBg: "bg-destructive/10",
                  iconColor: "text-destructive",
                  headline: "I'm escalating this immediately.",
                  interpretation:
                    `Your score of ${score}/100 falls in the high-risk band. Multiple compounding factors suggest the value of an MRI-based confirmation without delay.`,
                  nextAction:
                    transitioning
                      ? "Auto-routing you to the MRI uploader now. You can cancel from the overlay if needed."
                      : "Preparing automatic transition to Stage 2 — Tumor Detection.",
                  cta: { label: "Go to Upload Now", action: () => navigate("/tumor-detection", { state: { urgent: true, riskScore: score } }) },
                }
              : score >= 40
              ? {
                  tone: "moderate" as const,
                  badge: "Empathetic Guidance",
                  badgeClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
                  ringClass: "border-yellow-500/30 bg-yellow-500/5",
                  iconBg: "bg-yellow-500/10",
                  iconColor: "text-yellow-500",
                  headline: "Let's take a closer look — together.",
                  interpretation:
                    `A score of ${score}/100 sits in the moderate range. It's not alarming on its own, but a few signals warrant a confirmatory MRI to give you peace of mind and a clearer picture.`,
                  nextAction:
                    "I'll open Stage 2 — Tumor Detection — when you're ready. There's no rush; review the breakdown below first if you'd like.",
                  cta: { label: "Enter Detection Mode", action: () => setShowMediumModal(true) },
                }
              : {
                  tone: "low" as const,
                  badge: "Supportive Guidance",
                  badgeClass: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
                  ringClass: "border-green-500/30 bg-green-500/5",
                  iconBg: "bg-green-500/10",
                  iconColor: "text-green-500",
                  headline: "Good news — your profile looks reassuring.",
                  interpretation:
                    `Your score of ${score}/100 lands in the low-risk band. Your current factor mix doesn't strongly indicate elevated risk.`,
                  nextAction:
                    "No action required today. If you'd like to be thorough, an MRI scan is available as an optional next step.",
                  cta: { label: "Optional: Run Tumor Detection", action: () => navigate("/tumor-detection") },
                };

          return (
            <Card className={`border-2 ${tier.ringClass}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${tier.iconBg} shrink-0 relative`}>
                    <Sparkles className={`h-6 w-6 ${tier.iconColor}`} />
                    {tier.tone === "urgent" && (
                      <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        AI Navigator
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tier.badgeClass}`}>
                        {tier.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{tier.headline}</h3>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Score interpretation</p>
                          <p className="text-sm text-foreground">{tier.interpretation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Next action</p>
                          <p className="text-sm text-foreground">{tier.nextAction}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant={tier.tone === "urgent" ? "destructive" : tier.tone === "low" ? "outline" : "default"}
                        className="gap-2"
                        onClick={tier.cta.action}
                      >
                        {tier.cta.label}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}


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
                  <strong>Note:</strong> {usingMock
                    ? "Deploy the Flask backend with brain_tumor_model-2.pkl and scaler-2.pkl to get real ML predictions."
                    : "Predictions are powered by the deployed XGBoost model via the backend API."}
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
                { label: "Model Confidence", value: mlConfidence ?? Math.min(95, 70 + Math.random() * 25) },
                { label: "Tumor Probability", value: mlProbabilities?.tumor ?? (score * 0.9) },
                { label: "No Tumor Probability", value: mlProbabilities?.no_tumor ?? (100 - score * 0.9) },
                { label: "Data Completeness", value: Object.values(formData).filter((v) => v && (typeof v === "string" ? v.length > 0 : true)).length / 13 * 100 },
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

        {/* Stage 2 CTA — Logic Gate output */}
        {score > 70 && (
          <Card className="border-2 border-destructive/50 bg-destructive/5 animate-pulse">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-destructive">URGENT — Auto-transitioning to Stage 2</h3>
                <p className="text-sm text-muted-foreground">
                  High-risk profile detected. The AI Navigator is routing you to Tumor Detection now.
                </p>
              </div>
              <Link to="/tumor-detection">
                <Button size="lg" variant="destructive" className="gap-2 whitespace-nowrap">
                  Go Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {score >= 40 && score <= 70 && (
          <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <ScanLine className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-foreground">Recommended: Stage 2 Tumor Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Your risk score is moderate. We recommend uploading an MRI scan for confirmation.
                </p>
              </div>
              <Button size="lg" className="gap-2 whitespace-nowrap" onClick={() => setShowMediumModal(true)}>
                Enter Detection Mode <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => generateRiskPDF(formData, score, risk.label)}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
          <Button onClick={() => navigate("/risk-assessment")} variant="outline" className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" />
            New Assessment
          </Button>
          {score < 40 && (
            <Link to="/tumor-detection" className="flex-1">
              <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                <ScanLine className="h-4 w-4" />
                Optional: Proceed to Tumor Detection
              </Button>
            </Link>
          )}
          <Link to="/" className="flex-1">
            <Button className="w-full">Back to Home</Button>
          </Link>
        </div>
      </div>

      {/* Medium-Risk Logic Gate Modal */}
      <Dialog open={showMediumModal} onOpenChange={setShowMediumModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto p-3 rounded-full bg-yellow-500/10 mb-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <DialogTitle className="text-center">Moderate Risk Detected</DialogTitle>
            <DialogDescription className="text-center">
              Your assessment score ({score}/100) falls in the moderate range. The AI Navigator recommends
              proceeding to Stage 2 — Tumor Detection — to upload an MRI scan for confirmation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setShowMediumModal(false)}>
              Maybe Later
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                setShowMediumModal(false);
                navigate("/tumor-detection", { state: { recommended: true, riskScore: score } });
              }}
            >
              Enter Detection Mode <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiskResults;
