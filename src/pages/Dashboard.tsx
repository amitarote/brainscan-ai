import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ArrowLeft, Activity, ScanLine, ClipboardList, Trash2 } from "lucide-react";
import { getRiskHistory, getTumorHistory, type RiskRecord, type TumorRecord } from "@/lib/history";

const riskColor = (level: string) => {
  if (level.includes("Critical")) return "text-red-500";
  if (level.includes("High")) return "text-orange-500";
  if (level.includes("Moderate")) return "text-yellow-500";
  return "text-green-500";
};

const Dashboard = () => {
  const [riskHistory, setRiskHistory] = useState<RiskRecord[]>(getRiskHistory());
  const [tumorHistory, setTumorHistory] = useState<TumorRecord[]>(getTumorHistory());

  const clearRisk = () => {
    localStorage.removeItem("neuroscan_risk_history");
    setRiskHistory([]);
  };
  const clearTumor = () => {
    localStorage.removeItem("neuroscan_tumor_history");
    setTumorHistory([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Patient Dashboard</h1>
              <p className="text-muted-foreground">Assessment and detection history</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{riskHistory.length}</p>
                <p className="text-sm text-muted-foreground">Risk Assessments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <ScanLine className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{tumorHistory.length}</p>
                <p className="text-sm text-muted-foreground">Tumor Scans</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {tumorHistory.filter((t) => t.tumorDetected).length}
                </p>
                <p className="text-sm text-muted-foreground">Tumors Detected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <Tabs defaultValue="risk">
          <TabsList>
            <TabsTrigger value="risk">Risk Assessments</TabsTrigger>
            <TabsTrigger value="tumor">Tumor Detections</TabsTrigger>
          </TabsList>

          <TabsContent value="risk">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Risk Assessment History</CardTitle>
                  <CardDescription>Stage 1 risk prediction results</CardDescription>
                </div>
                {riskHistory.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearRisk} className="gap-1 text-muted-foreground">
                    <Trash2 className="h-4 w-4" /> Clear
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {riskHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>No assessments yet.</p>
                    <Link to="/risk-assessment">
                      <Button className="mt-4">Start Assessment</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Risk Level</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {riskHistory.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="text-sm">{new Date(r.date).toLocaleDateString()}</TableCell>
                            <TableCell>{r.age}</TableCell>
                            <TableCell className="capitalize">{r.gender}</TableCell>
                            <TableCell className="font-bold">{r.score}</TableCell>
                            <TableCell>
                              <span className={`font-medium ${riskColor(r.riskLevel)}`}>{r.riskLevel}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tumor">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tumor Detection History</CardTitle>
                  <CardDescription>Stage 2 MRI scan analysis results</CardDescription>
                </div>
                {tumorHistory.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearTumor} className="gap-1 text-muted-foreground">
                    <Trash2 className="h-4 w-4" /> Clear
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {tumorHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ScanLine className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>No scans yet.</p>
                    <Link to="/tumor-detection">
                      <Button className="mt-4">Upload MRI Scan</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tumor Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Confidence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tumorHistory.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="text-sm">{new Date(t.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`font-medium ${t.tumorDetected ? "text-red-500" : "text-green-500"}`}>
                                {t.tumorDetected ? "Detected" : "Clear"}
                              </span>
                            </TableCell>
                            <TableCell>{t.tumorType}</TableCell>
                            <TableCell>{t.location}</TableCell>
                            <TableCell>{t.confidence.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
