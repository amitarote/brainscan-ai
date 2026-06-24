import { motion } from "framer-motion";
import { Brain, Target, Activity, Sparkles } from "lucide-react";

/**
 * Stage2Viewer — "Antigravity" MRI viewer
 *
 * Aesthetic spec:
 *   - Dark blue-grey background (#0a0f1e)
 *   - Vibrant cyan + purple glow accents
 *   - MRI panel with translucent red pulsing heatmap on the anomaly
 *   - Independent floating "Confidence Gauge" widget
 *   - All transitions via framer-motion (weightless float-in)
 */

interface Stage2ViewerProps {
  /** 0.0 – 1.0 probability that an anomaly is present */
  confidence: number;
  /** Image source for the underlying MRI scan (optional — falls back to mock) */
  imageSrc?: string;
  /** Anatomical label e.g. "Right Parietal Lobe" */
  anomalyLabel?: string;
  /** Anomaly position on the scan in % (0–100) */
  anomalyPos?: { top: number; left: number };
}

const ConfidenceGauge = ({ value }: { value: number }) => {
  const pct = Math.max(0, Math.min(1, value));
  const r = 46;
  const c = 2 * Math.PI * r;
  const danger = pct >= 0.7;
  const warn = pct >= 0.4 && pct < 0.7;
  const ringStroke = danger ? "#ef4444" : warn ? "#eab308" : "#10b981";
  const glow = danger
    ? "0 0 32px rgba(239,68,68,0.55)"
    : warn
      ? "0 0 28px rgba(234,179,8,0.45)"
      : "0 0 24px rgba(16,185,129,0.4)";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="relative rounded-2xl border border-cyan-400/20 bg-[#0a0f1e]/80 backdrop-blur-xl p-4"
      style={{ boxShadow: `${glow}, 0 0 0 1px rgba(34,211,238,0.08) inset` }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300/70 mb-2">
          Confidence
        </div>
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={ringStroke} stopOpacity="1" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
            <motion.circle
              cx="60"
              cy="60"
              r={r}
              stroke="url(#gaugeGrad)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: c - pct * c }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
              style={{ filter: `drop-shadow(0 0 6px ${ringStroke})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-3xl font-bold tabular-nums"
              style={{ color: ringStroke, textShadow: `0 0 12px ${ringStroke}80` }}
            >
              {Math.round(pct * 100)}
              <span className="text-base text-white/80">%</span>
            </motion.span>
            <span className="text-[9px] uppercase tracking-widest text-white/80 mt-0.5">
              {danger ? "High" : warn ? "Moderate" : "Low"}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Stage2Viewer = ({
  confidence,
  imageSrc,
  anomalyLabel = "Right Parietal Lobe",
  anomalyPos = { top: 42, left: 58 },
}: Stage2ViewerProps) => {
  const danger = confidence >= 0.7;

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-cyan-400/15"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, rgba(34,211,238,0.10), transparent 55%), radial-gradient(circle at 90% 100%, rgba(168,85,247,0.12), transparent 55%), #0a0f1e",
      }}
    >
      {/* Floating cyan + purple ambient orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl"
      />

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/20 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-cyan-400" />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-cyan-200/90">
            Stage 2 · MRI Viewer
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/80">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Heatmap active
          </span>
          <span className="text-white/40" aria-hidden="true">|</span>
          <span className="font-mono">CNN v2.1</span>
        </div>
      </motion.div>

      {/* MRI canvas */}
      <div className="relative aspect-[16/10] w-full">
        {imageSrc ? (
          <motion.img
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 0.92, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            src={imageSrc}
            alt="MRI scan"
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          // Mock brain silhouette when no image provided
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative h-[70%] aspect-square rounded-[42%] border border-cyan-400/25 bg-gradient-to-br from-slate-800/60 to-slate-900/80 shadow-[inset_0_0_60px_rgba(34,211,238,0.15)]">
              <div className="absolute inset-6 rounded-[40%] border border-white/5" />
              <div className="absolute inset-12 rounded-[38%] border border-white/5" />
            </div>
          </motion.div>
        )}

        {/* Subtle scan grid */}
        <div className="absolute inset-0 pointer-events-none opacity-15 [background-image:linear-gradient(to_right,rgba(34,211,238,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.4)_1px,transparent_1px)] [background-size:56px_56px]" />

        {/* Translucent red pulsing heatmap on the anomaly */}
        {danger && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute pointer-events-none"
            style={{
              top: `${anomalyPos.top}%`,
              left: `${anomalyPos.left}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.55, 0.85, 0.55] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-40 w-40"
            >
              <div className="absolute inset-0 rounded-full bg-red-500/40 blur-3xl" />
              <div className="absolute inset-6 rounded-full bg-red-500/55 blur-2xl" />
              <div className="absolute inset-12 rounded-full bg-red-600/65 blur-lg" />
            </motion.div>

            {/* Crosshair target */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="relative h-24 w-24 rounded-full border border-cyan-300/60"
              >
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              </motion.div>
              <div className="absolute h-px w-32 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
              <div className="absolute h-32 w-px bg-gradient-to-b from-transparent via-cyan-300/80 to-transparent" />
              <div className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]" />
            </div>

            {/* Label callout */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute left-[80px] top-[-6px] whitespace-nowrap rounded-lg border border-cyan-400/40 bg-[#0a0f1e]/90 backdrop-blur px-2.5 py-1.5 text-[11px] text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <Target className="h-3 w-3 text-red-400" />
                {anomalyLabel}
              </div>
              <div className="text-[10px] text-cyan-300/70 mt-0.5">
                Anomaly · {Math.round(confidence * 100)}% conf.
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Floating confidence gauge — top right */}
        <div className="absolute top-4 right-4">
          <ConfidenceGauge value={confidence} />
        </div>

        {/* Floating status pill — bottom left */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0f1e]/80 backdrop-blur-md px-3 py-1.5"
        >
          <Activity className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-white/70">
            SLICE 64/128 · {danger ? "FLAG" : "CLEAR"}
          </span>
        </motion.div>

        {/* Floating sparkle accent */}
        <motion.div
          animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-6 left-6"
        >
          <Sparkles className="h-4 w-4 text-purple-400/80" />
        </motion.div>
      </div>
    </div>
  );
};

export default Stage2Viewer;
