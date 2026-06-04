type BuildDailyPlanInput = {
  dailyScore: number;
  earliestArriveBy: string | null;
  hasAlert: boolean;
  hasReservation: boolean;
};

function tier(dailyScore: number) {
  if (dailyScore >= 0.82) {
    return "extreme";
  }

  if (dailyScore >= 0.64) {
    return "high";
  }

  if (dailyScore >= 0.42) {
    return "moderate";
  }

  return "low";
}

export function buildHeadline(dailyScore: number, dow: number) {
  const dayType = dow === 0 || dow === 6 ? "weekend" : "weekday";

  switch (tier(dailyScore)) {
    case "extreme":
      return `Busiest ${dayType} pattern — beat the rush early`;
    case "high":
      return "Busy day — arrive early and keep the middle of the day flexible";
    case "moderate":
      return "Moderate crowds — a morning start should keep things smooth";
    case "low":
      return "Calmer outlook — most lots should stay manageable";
  }
}

export function buildDailyPlan({
  dailyScore,
  earliestArriveBy,
  hasAlert,
  hasReservation
}: BuildDailyPlanInput) {
  const arriveStep =
    earliestArriveBy && earliestArriveBy !== "Anytime"
      ? `Leave with enough buffer to park before ${earliestArriveBy}.`
      : "Start with the highest-priority stop while parking is calm.";

  const steps = [arriveStep];

  if (hasReservation) {
    steps.push("Confirm reservation details and keep the pass easy to reach.");
  }

  if (hasAlert) {
    steps.push("Check current park alerts before leaving for the entrance.");
  }

  if (dailyScore >= 0.64) {
    steps.push("Use late morning for the core area, then shift to a quieter stop after lunch.");
  } else if (dailyScore >= 0.42) {
    steps.push("Visit the main trailhead first, then leave room for a slower midday pace.");
  } else {
    steps.push("Keep the plan loose and use midday for overlooks or shorter walks.");
  }

  if (steps.length < 4) {
    steps.push("Save one flexible backup stop in case weather or closures change the day.");
  }

  return steps.slice(0, 4);
}
