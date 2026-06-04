import { cn } from "@/lib/utils";
import type {
  ForecastConfidence,
  ForecastSource
} from "@/components/forecast/types";

type ConfidenceChipProps = {
  confidence: ForecastConfidence;
  source: ForecastSource;
};

const confidenceClasses = {
  high: "border-green/30 bg-green-soft text-green",
  medium: "border-amber/35 bg-amber-soft text-amber-deep",
  low: "border-border bg-white/60 text-ink-soft"
};

const sourceLabels: Record<ForecastSource, string> = {
  live: "Live-informed",
  mixed: "Prediction",
  prediction: "Prediction"
};

export function ConfidenceChip({ confidence, source }: ConfidenceChipProps) {
  const label = `${confidence[0]?.toUpperCase()}${confidence.slice(
    1
  )} confidence`;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold",
        confidenceClasses[confidence]
      )}
    >
      {label} · {sourceLabels[source]}
    </span>
  );
}
