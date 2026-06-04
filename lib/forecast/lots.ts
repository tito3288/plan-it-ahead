import {
  forecastConfig,
  type ForecastStatus
} from "@/lib/forecast/config";

export type ForecastLot = {
  id: string;
  name: string;
  note: string | null;
  typical_fill_hour: number | null;
};

export type LotPrediction = {
  arrive_by: string;
  level: ForecastStatus;
  lot_id: string;
  lot_name: string;
  note: string | null;
};

function formatTime(hour: number, minutes: number) {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 === 0 ? 12 : normalizedHour % 12;
  const displayMinutes = String(minutes).padStart(2, "0");

  return `${displayHour}:${displayMinutes} ${suffix}`;
}

function minutesToTime(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return formatTime(hour, minutes);
}

function firstRedHour(hourlyStatus: ForecastStatus[]) {
  const index = hourlyStatus.findIndex((status) => status === 2);

  return index === -1 ? null : forecastConfig.hourlySlots[index];
}

function statusAtOrAfterHour(hour: number, hourlyStatus: ForecastStatus[]) {
  const index = forecastConfig.hourlySlots.findIndex((slot) => slot >= hour);

  if (index === -1) {
    return 0;
  }

  return Math.max(...hourlyStatus.slice(index)) as ForecastStatus;
}

export function predictLots(
  lots: ForecastLot[],
  dailyScore: number,
  hourlyStatus: ForecastStatus[],
  parkTimezone: string
): LotPrediction[] {
  void parkTimezone;

  const fallbackRedHour = firstRedHour(hourlyStatus);

  return lots.map((lot) => {
    const fillHour = lot.typical_fill_hour ?? fallbackRedHour;
    const level = fillHour === null ? 0 : statusAtOrAfterHour(fillHour, hourlyStatus);

    if (
      fillHour === null ||
      level < 2 ||
      dailyScore < forecastConfig.lots.calmScoreCutoff
    ) {
      return {
        arrive_by: "Anytime",
        level: 0,
        lot_id: lot.id,
        lot_name: lot.name,
        note: lot.note
      };
    }

    const busyShift =
      Math.min(1, Math.max(0, dailyScore)) * forecastConfig.lots.maxBusyShiftMinutes;
    const arriveByMinutes = Math.max(
      5 * 60,
      Math.round(
        fillHour * 60 - forecastConfig.lots.arriveByBufferMinutes - busyShift
      )
    );

    return {
      arrive_by: minutesToTime(arriveByMinutes),
      level,
      lot_id: lot.id,
      lot_name: lot.name,
      note: lot.note
    };
  });
}
