import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, X, Send, MessageCircle, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tone = "info" | "empathetic" | "urgent" | "supportive";

interface AIMessage {
  id: string;
  text: string;
  tone?: Tone;
  // When true, renders with the typewriter effect instead of instantly
  typewriter?: boolean;
}

// ────────────────────────────────────────────────────────────
// Global event channel — any page can call:
//   window.dispatchEvent(new CustomEvent("ai-navigator:say",
//     { detail: { text: "...", tone: "urgent", open: true } }))
// ────────────────────────────────────────────────────────────
export const sayToNavigator = (
  text: string,
  opts: { tone?: Tone; open?: boolean } = {},
) => {
  window.dispatchEvent(
    new CustomEvent("ai-navigator:say", {
      detail: { text, tone: opts.tone ?? "info", open: opts.open ?? false },
    }),
  );
};

// Per-route guidance shown when the panel opens or the route changes
const ROUTE_GUIDANCE: Record<string, { greeting: string; tone: Tone }> = {
  "/": {
    greeting:
      "Hi, I'm your AI Health Assistant. I'll guide you through the dual-stage brain tumor screening — Stage 1 evaluates your risk profile, Stage 2 analyzes an MRI scan. Ready when you are.",
    tone: "info",
  },
  "/risk-assessment": {
    greeting:
      "We ask about lifestyle, genetics and symptoms because each contributes a measurable signal to tumor risk. Answer honestly — nothing is stored on a server, and your responses stay private.",
    tone: "empathetic",
  },
  "/risk-results": {
    greeting:
      "Your Stage 1 score is in. I'll interpret what it means and recommend the right next step. Remember: this is decision support, not a diagnosis.",
    tone: "info",
  },
  "/tumor-detection": {
    greeting:
      "Upload a brain MRI in NIfTI (.nii) format. The CNN will analyze cross-sections and highlight any suspicious regions. Take your time — accuracy matters more than speed.",
    tone: "supportive",
  },
  "/dashboard": {
    greeting:
      "Here's your screening history. Patterns over time often reveal more than a single result. I can explain any record — just ask.",
    tone: "info",
  },
};

const FALLBACK = {
  greeting:
    "Hi, I'm your AI Health Assistant. Ask me anything about your screening journey.",
  tone: "info" as Tone,
};

// Lightweight rule-based reply (no backend) — empathetic, on-domain
const generateReply = (input: string, pathname: string): string => {
  const q = input.toLowerCase().trim();
  if (!q) return "I'm here whenever you'd like to ask something.";

  if (/(scared|worried|anxious|afraid|nervous)/.test(q))
    return "That feeling is completely valid. Most elevated risk scores do not turn out to be tumors — Stage 2 imaging exists precisely to bring clarity. You're doing the right thing by checking.";

  if (/(score|result|mean|interpret)/.test(q))
    return "Scores 0–39 indicate low probability, 40–69 suggest a precautionary MRI, and 70+ warrant immediate Stage 2 detection. The number is a probability estimate from the ML model, not a diagnosis.";

  if (/(mri|upload|nii|scan|stage 2)/.test(q))
    return "Head to the Tumor Detection page and upload a .nii MRI file. The CNN segments tissue and flags any suspicious region with a confidence score.";

  if (/(privacy|data|store|save)/.test(q))
    return "Your assessment data is processed in your browser and only saved locally to your screening history. Nothing is shared with third parties.";

  if (/(why|reason).*(symptom|question|asking)/.test(q))
    return "Each question maps to a known risk factor — for example, persistent headaches with vision changes weight the model differently than fatigue alone. Together they refine the probability estimate.";

  if (/(doctor|specialist|consult)/.test(q))
    return "If your score is ≥40 or you have any acute symptoms, please consult a neurologist. This tool supports — never replaces — clinical evaluation.";

  if (pathname === "/risk-assessment")
    return "Fill in what you know — leave fields blank if unsure. The model handles partial data gracefully.";
  if (pathname === "/tumor-detection")
    return "If your file isn't .nii, convert it from DICOM first. Most hospital scanners can export NIfTI directly.";

  return "I can explain your risk score, walk you through MRI upload, or discuss any symptom. What would help most?";
};

// ────────────────────────────────────────────────────────────
// Typewriter renderer
// ────────────────────────────────────────────────────────────
const Typewriter = ({
  text,
  speed = 18,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) => {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <span>
      {shown}
      {shown.length < text.length && (
        <span className="inline-block w-1.5 h-4 bg-primary/70 align-middle ml-0.5 animate-pulse" />
      )}
    </span>
  );
};

const toneStyles: Record<Tone, string> = {
  info: "bg-muted/60 border-border",
  empathetic: "bg-primary/5 border-primary/20",
  urgent: "bg-destructive/10 border-destructive/40",
  supportive: "bg-emerald-500/10 border-emerald-500/30",
};

const toneIcon: Record<Tone, JSX.Element> = {
  info: <MessageCircle className="h-3.5 w-3.5 text-primary" />,
  empathetic: <Sparkles className="h-3.5 w-3.5 text-primary" />,
  urgent: <AlertTriangle className="h-3.5 w-3.5 text-destructive" />,
  supportive: <Sparkles className="h-3.5 w-3.5 text-emerald-500" />,
};

const AINavigator = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [userMsgs, setUserMsgs] = useState<{ id: string; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const guidance = useMemo(
    () => ROUTE_GUIDANCE[location.pathname] ?? FALLBACK,
    [location.pathname],
  );

  // Greet on route change
  useEffect(() => {
    setMessages([
      {
        id: `greet-${location.pathname}-${Date.now()}`,
        text: guidance.greeting,
        tone: guidance.tone,
        typewriter: true,
      },
    ]);
    setUserMsgs([]);
  }, [location.pathname, guidance]);

  // Listen for global "say" events (e.g. urgent high-risk alert)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        text: string;
        tone?: Tone;
        open?: boolean;
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `say-${Date.now()}`,
          text: detail.text,
          tone: detail.tone ?? "info",
          typewriter: true,
        },
      ]);
      if (detail.open) setOpen(true);
      else setUnread((u) => u + 1);
    };
    window.addEventListener("ai-navigator:say", handler);
    return () => window.removeEventListener("ai-navigator:say", handler);
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, userMsgs, open]);

  // Reset unread when opened
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setUserMsgs((u) => [...u, { id: `u-${Date.now()}`, text }]);
    setDraft("");
    const reply = generateReply(text, location.pathname);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `r-${Date.now()}`,
          text: reply,
          tone: "info",
          typewriter: true,
        },
      ]);
    }, 350);
  };

  // Interleave AI messages and user messages by timestamp encoded in id
  const timeline = useMemo(() => {
    const all = [
      ...messages.map((m) => ({ kind: "ai" as const, ...m })),
      ...userMsgs.map((m) => ({ kind: "user" as const, ...m, tone: undefined as Tone | undefined, typewriter: false })),
    ];
    return all.sort((a, b) => {
      const ta = parseInt(a.id.split("-").pop() || "0", 10);
      const tb = parseInt(b.id.split("-").pop() || "0", 10);
      return ta - tb;
    });
  }, [messages, userMsgs]);

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI Health Assistant"
          className="fixed bottom-5 right-5 z-[90] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        >
          <Bot className="h-6 w-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center border-2 border-background">
              {unread}
            </span>
          )}
          <span className="absolute inset-0 rounded-full ring-2 ring-primary/40 animate-ping pointer-events-none" />
        </button>
      )}

      {/* Panel */}
      <aside
        className={cn(
          "fixed z-[95] bg-card border border-border shadow-2xl transition-all duration-300",
          // Mobile: full width drawer at the bottom; Desktop: side panel
          "right-0 bottom-0 w-full sm:right-5 sm:bottom-5 sm:w-[380px] sm:rounded-2xl",
          "flex flex-col",
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-8 opacity-0 pointer-events-none",
        )}
        style={{ maxHeight: "min(640px, 85vh)", height: "min(640px, 85vh)" }}
        aria-hidden={!open}
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent rounded-t-2xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">
                AI Health Assistant
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                Always-on guidance · Decision support
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {timeline.map((m) => {
            if (m.kind === "user") {
              return (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3 py-2 text-sm">
                    {m.text}
                  </div>
                </div>
              );
            }
            const tone = m.tone ?? "info";
            return (
              <div key={m.id} className="flex gap-2">
                <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl rounded-tl-sm border px-3 py-2 text-sm text-foreground leading-relaxed",
                    toneStyles[tone],
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {toneIcon[tone]}
                    <span>
                      {tone === "urgent"
                        ? "Urgent"
                        : tone === "empathetic"
                          ? "Guidance"
                          : tone === "supportive"
                            ? "Support"
                            : "Assistant"}
                    </span>
                  </div>
                  {m.typewriter ? <Typewriter text={m.text} /> : <span>{m.text}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-border p-3 flex items-center gap-2 bg-background/40 rounded-b-2xl"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about your score, symptoms, MRI…"
            className="flex-1"
            aria-label="Message AI Health Assistant"
          />
          <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Disclaimer */}
        <div className="px-3 pb-3 -mt-1">
          <p className="text-[10px] text-muted-foreground text-center leading-snug">
            AI guidance only — not a medical diagnosis. Consult a licensed clinician for care decisions.
          </p>
        </div>
      </aside>
    </>
  );
};

export default AINavigator;
