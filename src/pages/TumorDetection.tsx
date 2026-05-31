import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  ArrowLeft,
  Upload,
  ImageIcon,
  X,
  AlertTriangle,
  CheckCircle2,
  ScanLine,
  Target,
  Layers,
  ZoomIn,
  Download,
  Bot,
  Stethoscope,
  Activity,
  Ruler,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { generateTumorPDF } from "@/lib/generatePDF";
import { saveTumorRecord } from "@/lib/history";
import { useEffect } from "react";
import { sayToNavigator } from "@/components/AINavigator";
import NiftiSlice from "@/components/NiftiSlice";

type DetectionResult = {
  tumorDetected: boolean;
  tumorType: string;
  confidence: number;
  location: string;
  size: string;
  recommendations: string[];
  segmentationData: { label: string; value: number; color: string }[];
};

const mockDetection = (): DetectionResult => {
  const detected = Math.random() > 0.3;
  const types = ["Glioma", "Meningioma", "Pituitary Adenoma"];
  const sides = ["Right", "Left"];
  const lobes = ["Frontal Lobe", "Temporal Lobe", "Parietal Lobe", "Cerebellum"];
  const location = detected
    ? `${sides[Math.floor(Math.random() * sides.length)]} ${lobes[Math.floor(Math.random() * lobes.length)]}`
    : "N/A";
  return {
    tumorDetected: detected,
    tumorType: detected ? types[Math.floor(Math.random() * types.length)] : "N/A",
    confidence: detected ? 85 + Math.random() * 13 : 92 + Math.random() * 7,
    location,
    size: detected ? `${(0.8 + Math.random() * 3.5).toFixed(1)} cm` : "N/A",
    recommendations: detected
      ? ["Consult a neuro-oncologist immediately", "Schedule a contrast-enhanced MRI", "Consider biopsy for histological confirmation", "Discuss treatment options with care team"]
      : ["No abnormalities detected", "Continue routine screening as recommended", "Maintain regular follow-up schedule"],
    segmentationData: detected
      ? [
          { label: "Tumor Core", value: 15 + Math.random() * 20, color: "bg-red-500" },
          { label: "Edema Region", value: 8 + Math.random() * 15, color: "bg-yellow-500" },
          { label: "Enhancing Tumor", value: 5 + Math.random() * 12, color: "bg-orange-500" },
          { label: "Healthy Tissue", value: 0, color: "bg-green-500" },
        ].map((s, _, arr) => {
          if (s.label === "Healthy Tissue") return { ...s, value: 100 - arr.slice(0, 3).reduce((a, b) => a + b.value, 0) };
          return s;
        })
      : [{ label: "Healthy Tissue", value: 100, color: "bg-green-500" }],
  };
};

const TumorDetection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // A11y: when arriving at /tumor-detection (e.g. from the high-risk overlay),
  // move focus to the page's main heading so keyboard/SR users get a clear anchor.
  useEffect(() => {
    const t = setTimeout(() => {
      headingRef.current?.focus({ preventScroll: false });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const isValidNii = (file: File) => {
    const name = file.name.toLowerCase();
    return name.endsWith(".nii") || name.endsWith(".nii.gz");
  };

  const handleFile = useCallback((file: File) => {
    if (!isValidNii(file)) {
      toast.error("Invalid file format", {
        description: "Please upload a .nii or .nii.gz MRI file only.",
      });
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
    setResult(null);

    const stages = [
      "Preprocessing MRI scan...",
      "Applying noise reduction...",
      "Running CNN feature extraction...",
      "Performing tumor segmentation...",
      "Classifying tumor type...",
      "Generating analysis report...",
    ];

    let i = 0;
    const interval = setInterval(() => {
      i++;
      const p = Math.min((i / (stages.length * 5)) * 100, 99);
      setProgress(p);
      setStage(stages[Math.min(Math.floor(i / 5), stages.length - 1)]);
      if (i >= stages.length * 5) {
        clearInterval(interval);
        setProgress(100);
        setStage("Analysis complete");
        setTimeout(() => {
          setAnalyzing(false);
          const detection = mockDetection();
          setResult(detection);
          saveTumorRecord({
            tumorDetected: detection.tumorDetected,
            tumorType: detection.tumorType,
            confidence: detection.confidence,
            location: detection.location,
          });
          if (detection.tumorDetected) {
            sayToNavigator(
              `I've identified a ${detection.tumorType} in the ${detection.location} with ${detection.confidence.toFixed(1)}% confidence. The next step is a specialist consult — I recommend a neuro-oncologist within 7 days.`,
              { tone: "urgent", open: true },
            );
          } else {
            sayToNavigator(
              `Good news — no tumor signature was detected (${detection.confidence.toFixed(1)}% confidence). Continue routine screening and revisit if new symptoms appear.`,
              { tone: "supportive", open: false },
            );
          }
        }, 500);
      }
    }, 120);
  };

  const clearImage = () => {
    setImage(null);
    setFileName("");
    setResult(null);
    setAnalyzing(false);
    setProgress(0);
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
              <h1 ref={headingRef} tabIndex={-1} className="text-2xl md:text-3xl font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">Stage 2: Tumor Detection</h1>
              <p className="text-muted-foreground">Upload an MRI scan for AI-powered tumor analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`container mx-auto px-4 py-8 ${result ? "max-w-7xl" : "max-w-4xl"} space-y-8 transition-all duration-700 ease-out ${
          pageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {/* Disclaimer */}
        <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50 border border-accent">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            This is a simulated detection demo. In production, MRI scans would be processed by the trained CNN model (brain_tumor_model.pkl) via a secure backend.
          </p>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              MRI Scan Upload
            </CardTitle>
            <CardDescription>Upload a brain MRI file (.nii or .nii.gz format)</CardDescription>
          </CardHeader>
          <CardContent>
            {!image ? (
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  dragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <div className="p-4 rounded-full bg-primary/10">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Drag & drop your MRI scan here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Supports .nii and .nii.gz files only</p>
                </div>
                <input type="file" className="hidden" accept=".nii,.nii.gz" onChange={onFileSelect} />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Brain className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-foreground font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground">NIfTI MRI file ready for analysis</p>
                  </div>
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {!analyzing && !result && (
                  <Button onClick={runAnalysis} size="lg" className="w-full gap-2">
                    <ScanLine className="h-5 w-5" />
                    Analyze MRI Scan
                  </Button>
                )}

                {analyzing && (
                  <div className="space-y-3 p-4 rounded-lg border border-border bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{stage}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && <DetectionResults result={result} image={image!} />}
      </div>
    </div>
  );
};

// Circular confidence gauge — SVG ring
const ConfidenceGauge = ({ value, danger }: { value: number; danger: boolean }) => {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const stroke = danger ? "hsl(0 84% 60%)" : "hsl(142 71% 45%)";
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke={stroke}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${danger ? "text-red-500" : "text-emerald-500"}`}>
          {value.toFixed(1)}%
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</span>
      </div>
    </div>
  );
};

const DetectionResults = ({ result, image }: { result: DetectionResult; image: string }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const danger = result.tumorDetected;

  // Position of the abnormality marker on the scan (kept stable per render)
  const marker = { top: "42%", left: "58%" };

  return (
    <div className={`space-y-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      {/* Dashboard header strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${danger ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
          <h2 className="text-xl font-semibold text-foreground">
            {danger ? "Anomaly Detected" : "Scan Clear"}
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            CNN segmentation · MRI viewer
          </span>
        </div>
        <Button onClick={() => generateTumorPDF(result)} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Main dashboard grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* MRI Viewer (main focus) — spans 2 cols on desktop */}
        <Card className="lg:col-span-2 overflow-hidden border-border/60 bg-zinc-950 text-zinc-100">
          {/* Viewer toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium tracking-wide uppercase text-zinc-300">
                MRI Viewer · Axial T1
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Heatmap
              </span>
              <span>·</span>
              <span>1.0 mm slice</span>
            </div>
          </div>

          {/* Viewer canvas */}
          <div className="relative aspect-[4/3] w-full bg-black overflow-hidden">
            {/* Synthetic MRI brain rendering — .nii files aren't browser-renderable,
                so we show a stylized axial slice as a visual stand-in for the demo. */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Outer skull glow */}
              <div className="absolute h-[78%] aspect-square rounded-[44%] bg-gradient-to-br from-zinc-700/40 via-zinc-800/60 to-black blur-md" />
              {/* Brain silhouette */}
              <div
                className="relative h-[72%] aspect-square rounded-[42%] border border-white/10"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(180,180,200,0.55), rgba(80,80,100,0.35) 40%, rgba(20,20,30,0.9) 75%)",
                  boxShadow:
                    "inset 0 0 80px rgba(0,0,0,0.7), inset 0 0 30px rgba(120,140,180,0.15)",
                }}
              >
                {/* Cortex folds — concentric rings */}
                <div className="absolute inset-[8%] rounded-[40%] border border-white/8" />
                <div className="absolute inset-[16%] rounded-[38%] border border-white/8" />
                <div className="absolute inset-[26%] rounded-[36%] border border-white/6" />
                {/* Central fissure */}
                <div className="absolute top-[12%] bottom-[12%] left-1/2 w-px bg-white/15 -translate-x-1/2" />
                {/* Ventricle silhouettes */}
                <div className="absolute top-[42%] left-[38%] h-[14%] w-[10%] rounded-full bg-black/70 blur-[2px]" />
                <div className="absolute top-[42%] right-[38%] h-[14%] w-[10%] rounded-full bg-black/70 blur-[2px]" />
              </div>
            </div>

            {/* Filename badge — confirms which scan is being viewed */}
            <div className="absolute top-3 left-3 rounded-md border border-white/10 bg-black/60 backdrop-blur px-2.5 py-1 text-[10px] text-zinc-300 font-mono max-w-[55%] truncate">
              {image ? "MRI · loaded" : "MRI"}
            </div>

            {/* Crosshair grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-25 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />

            {danger && (
              <>
                {/* Pulsing red heatmap blob */}
                <div
                  className="absolute pointer-events-none"
                  style={{ top: marker.top, left: marker.left, transform: "translate(-50%, -50%)" }}
                >
                  <div className="relative h-32 w-32">
                    <div className="absolute inset-0 rounded-full bg-red-500/40 blur-2xl animate-pulse" />
                    <div className="absolute inset-4 rounded-full bg-red-500/50 blur-xl animate-pulse" />
                    <div className="absolute inset-8 rounded-full bg-red-600/60 blur-md animate-pulse" />
                  </div>
                </div>

                {/* Crosshair target marker */}
                <div
                  className="absolute pointer-events-none"
                  style={{ top: marker.top, left: marker.left, transform: "translate(-50%, -50%)" }}
                >
                  <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-2 border-white/90 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border border-white/40 animate-ping" />
                    {/* crosshair lines */}
                    <div className="absolute top-1/2 left-[-22px] right-[-22px] h-px bg-white/80" />
                    <div className="absolute left-1/2 top-[-22px] bottom-[-22px] w-px bg-white/80" />
                    <div className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                  </div>
                  {/* Label callout */}
                  <div className="absolute left-[60px] top-[-10px] whitespace-nowrap rounded-md border border-white/20 bg-black/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3 w-3 text-red-400" />
                      {result.location}
                    </div>
                    <div className="text-[10px] text-zinc-300">≈ {result.size}</div>
                  </div>
                </div>
              </>
            )}

            {/* Confidence gauge — top-right floating */}
            <div className="absolute top-3 right-3 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-3">
              <ConfidenceGauge value={result.confidence} danger={danger} />
            </div>

            {/* Bottom-left scan meta */}
            <div className="absolute bottom-3 left-3 rounded-md border border-white/10 bg-black/60 backdrop-blur px-2.5 py-1.5 text-[10px] text-zinc-300 font-mono">
              <div>SLICE 64 / 128</div>
              <div className="text-zinc-500">CNN v2.1 · {danger ? "FLAG" : "CLEAR"}</div>
            </div>
          </div>
        </Card>

        {/* Right column: stack of panels */}
        <div className="space-y-5">
          {/* Tumor Characteristics */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Tumor Characteristics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {danger ? (
                <>
                  <CharRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Classification" value={result.tumorType} />
                  <CharRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={result.location} />
                  <CharRow icon={<Ruler className="h-3.5 w-3.5" />} label="Estimated Size" value={result.size} />
                  <CharRow icon={<Target className="h-3.5 w-3.5" />} label="Confidence" value={`${result.confidence.toFixed(1)}%`} />
                  <div className="pt-2 mt-2 border-t border-border">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Suggested classification
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                        WHO Grade II–III (provisional)
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        Requires biopsy
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No abnormalities detected across analyzed slices. Tissue distribution within normal range.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tissue Segmentation */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Tissue Segmentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {result.segmentationData.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">{s.label}</span>
                    <span className="text-muted-foreground font-mono">{s.value.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.color} transition-all duration-1000`}
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Navigator synthesis bar — bottom */}
      <Card
        className={`border-2 ${
          danger ? "border-red-500/40 bg-red-500/[0.03]" : "border-emerald-500/40 bg-emerald-500/[0.03]"
        }`}
      >
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${danger ? "bg-red-500/15" : "bg-emerald-500/15"}`}>
                <Bot className={`h-6 w-6 ${danger ? "text-red-500" : "text-emerald-500"}`} />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${danger ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                <Sparkles className="h-3 w-3" />
                AI Navigator · Synthesis
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {danger ? (
                  <>
                    A <span className="font-semibold">{result.tumorType}</span> was identified in the{" "}
                    <span className="font-semibold">{result.location}</span> measuring approximately{" "}
                    <span className="font-semibold">{result.size}</span>. Given the{" "}
                    <span className="font-semibold">{result.confidence.toFixed(1)}%</span> confidence, the
                    recommended next step is a specialist consult within 7 days.
                  </>
                ) : (
                  <>
                    The scan shows <span className="font-semibold">no detectable abnormalities</span> at{" "}
                    {result.confidence.toFixed(1)}% confidence. Continue routine screening per your usual schedule.
                  </>
                )}
              </p>
            </div>
            {danger ? (
              <Button asChild size="lg" className="gap-2 bg-red-500 hover:bg-red-600 text-white shrink-0">
                <Link to="/dashboard">
                  Navigate to Specialist Consult
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline" className="gap-2 shrink-0">
                <Link to="/dashboard">
                  View Screening History
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations list */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Clinical Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

const CharRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border last:border-0">
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
    <span className="text-sm font-medium text-foreground text-right">{value}</span>
  </div>
);

export default TumorDetection;
