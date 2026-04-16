import { useState, useCallback } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { generateTumorPDF } from "@/lib/generatePDF";
import { saveTumorRecord } from "@/lib/history";
import { useEffect } from "react";

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
  const locations = ["Frontal Lobe", "Temporal Lobe", "Parietal Lobe", "Cerebellum"];
  return {
    tumorDetected: detected,
    tumorType: detected ? types[Math.floor(Math.random() * types.length)] : "N/A",
    confidence: detected ? 85 + Math.random() * 13 : 92 + Math.random() * 7,
    location: detected ? locations[Math.floor(Math.random() * locations.length)] : "N/A",
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

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Stage 2: Tumor Detection</h1>
              <p className="text-muted-foreground">Upload an MRI scan for AI-powered tumor analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
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
            <CardDescription>Upload a brain MRI image (JPEG, PNG, DICOM supported)</CardDescription>
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
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG • Max 20MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={onFileSelect} />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-border bg-black/5">
                  <img src={image} alt="Uploaded MRI" className="w-full max-h-96 object-contain mx-auto" />
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-xs text-foreground">
                    {fileName}
                  </div>
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

const DetectionResults = ({ result, image }: { result: DetectionResult; image: string }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className={`space-y-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      {/* Detection Status */}
      <Card className={`border-2 ${result.tumorDetected ? "border-red-500/30" : "border-green-500/30"}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className={`p-4 rounded-full ${result.tumorDetected ? "bg-red-500/10" : "bg-green-500/10"}`}>
              {result.tumorDetected ? (
                <AlertTriangle className="h-10 w-10 text-red-500" />
              ) : (
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className={`text-2xl font-bold ${result.tumorDetected ? "text-red-500" : "text-green-500"}`}>
                {result.tumorDetected ? "Tumor Detected" : "No Tumor Detected"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {result.tumorDetected
                  ? `A ${result.tumorType} has been identified in the ${result.location} with ${result.confidence.toFixed(1)}% confidence.`
                  : `The scan appears normal with ${result.confidence.toFixed(1)}% confidence. No abnormalities were detected.`}
              </p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${result.tumorDetected ? "text-red-500" : "text-green-500"}`}>
                {result.confidence.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Confidence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scan with overlay */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-primary" />
              Analyzed Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg overflow-hidden border border-border bg-black">
              <img src={image} alt="Analyzed MRI" className="w-full object-contain" />
              {result.tumorDetected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 border-2 border-red-500 rounded-full animate-pulse opacity-60" />
                  <div className="absolute w-24 h-24 border border-red-500/40 rounded-full animate-ping opacity-30" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-xs text-foreground border border-border">
                AI Enhanced View
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        {result.tumorDetected && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Detection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Tumor Type", value: result.tumorType },
                { label: "Location", value: result.location },
                { label: "Estimated Size", value: result.size },
                { label: "Detection Confidence", value: `${result.confidence.toFixed(1)}%` },
              ].map((d) => (
                <div key={d.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{d.label}</span>
                  <span className="text-sm font-medium text-foreground">{d.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Segmentation */}
        <Card className={result.tumorDetected ? "" : "md:col-span-1"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Tissue Segmentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.segmentationData.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{s.label}</span>
                  <span className="text-muted-foreground">{s.value.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${s.color} transition-all duration-1000`} style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className={!result.tumorDetected ? "md:col-span-1" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
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

      {/* Download PDF */}
      <div className="pt-2">
        <Button onClick={() => generateTumorPDF(result)} variant="outline" className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Tumor Detection Report (PDF)
        </Button>
      </div>
    </div>
  );
};

export default TumorDetection;
