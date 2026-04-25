import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InfoTipProps {
  /** Why we ask this question */
  why: string;
  /** What it indicates for the Stage 1 risk score */
  indicates: string;
  label?: string;
}

const InfoTip = ({ why, indicates, label = "More info" }: InfoTipProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex items-center justify-center h-5 w-5 rounded-full text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 text-sm space-y-2 animate-in fade-in-0 zoom-in-95"
      >
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            Why we ask
          </p>
          <p className="text-foreground leading-relaxed">{why}</p>
        </div>
        <div className="pt-1 border-t border-border">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1 mt-2">
            Stage 1 signal
          </p>
          <p className="text-muted-foreground leading-relaxed">{indicates}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InfoTip;
