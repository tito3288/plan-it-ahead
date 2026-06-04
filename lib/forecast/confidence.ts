import {
  forecastConfig,
  type Confidence
} from "@/lib/forecast/config";

type ComputeConfidenceInput = {
  dataTier: number;
  daysOut: number;
  hasWeather: boolean;
};

export function computeConfidence({
  dataTier,
  daysOut,
  hasWeather
}: ComputeConfidenceInput): Confidence {
  if (!hasWeather) {
    return daysOut <= forecastConfig.confidence.noWeatherMediumDays
      ? "medium"
      : "low";
  }

  let score = 0;

  if (dataTier === 1) {
    score += 2;
  } else if (dataTier === 2) {
    score += 1;
  }

  score += 1;

  if (daysOut <= forecastConfig.confidence.nearTermDays) {
    score += 1;
  }

  if (daysOut > forecastConfig.confidence.farOutDays) {
    score -= 1;
  }

  if (score >= 3) {
    return "high";
  }

  if (score <= 0) {
    return "low";
  }

  return "medium";
}
