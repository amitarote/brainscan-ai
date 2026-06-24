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

export const RISK_KEY = "oncovision_risk_history";
export const TUMOR_KEY = "oncovision_tumor_history";

// Use sessionStorage so sensitive health data (risk scores, tumor results,
// demographics) is cleared when the tab closes — avoids indefinite plaintext
// persistence in the browser profile. Also proactively purge any legacy
// localStorage entries from prior versions.
if (typeof window !== "undefined") {
  try {
    window.localStorage.removeItem(RISK_KEY);
    window.localStorage.removeItem(TUMOR_KEY);
  } catch { /* ignore */ }
}

const store = (): Storage | null =>
  typeof window !== "undefined" ? window.sessionStorage : null;

export const saveRiskRecord = (record: Omit<RiskRecord, "id" | "date">) => {
  const s = store();
  if (!s) return;
  const history = getRiskHistory();
  history.unshift({ ...record, id: crypto.randomUUID(), date: new Date().toISOString() });
  s.setItem(RISK_KEY, JSON.stringify(history.slice(0, 50)));
};

export const getRiskHistory = (): RiskRecord[] => {
  const s = store();
  if (!s) return [];
  try {
    return JSON.parse(s.getItem(RISK_KEY) || "[]");
  } catch { return []; }
};

export const saveTumorRecord = (record: Omit<TumorRecord, "id" | "date">) => {
  const s = store();
  if (!s) return;
  const history = getTumorHistory();
  history.unshift({ ...record, id: crypto.randomUUID(), date: new Date().toISOString() });
  s.setItem(TUMOR_KEY, JSON.stringify(history.slice(0, 50)));
};

export const getTumorHistory = (): TumorRecord[] => {
  const s = store();
  if (!s) return [];
  try {
    return JSON.parse(s.getItem(TUMOR_KEY) || "[]");
  } catch { return []; }
};

export const clearAllHistory = () => {
  const s = store();
  if (!s) return;
  s.removeItem(RISK_KEY);
  s.removeItem(TUMOR_KEY);
};
