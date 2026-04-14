export interface RiskRecord {
  id: string;
  date: string;
  age: string;
  gender: string;
  score: number;
  riskLevel: string;
}

export interface TumorRecord {
  id: string;
  date: string;
  tumorDetected: boolean;
  tumorType: string;
  confidence: number;
  location: string;
}

const RISK_KEY = "neuroscan_risk_history";
const TUMOR_KEY = "neuroscan_tumor_history";

export const saveRiskRecord = (record: Omit<RiskRecord, "id" | "date">) => {
  const history = getRiskHistory();
  history.unshift({ ...record, id: crypto.randomUUID(), date: new Date().toISOString() });
  localStorage.setItem(RISK_KEY, JSON.stringify(history.slice(0, 50)));
};

export const getRiskHistory = (): RiskRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(RISK_KEY) || "[]");
  } catch { return []; }
};

export const saveTumorRecord = (record: Omit<TumorRecord, "id" | "date">) => {
  const history = getTumorHistory();
  history.unshift({ ...record, id: crypto.randomUUID(), date: new Date().toISOString() });
  localStorage.setItem(TUMOR_KEY, JSON.stringify(history.slice(0, 50)));
};

export const getTumorHistory = (): TumorRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(TUMOR_KEY) || "[]");
  } catch { return []; }
};
