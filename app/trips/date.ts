export function formatTripDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatItineraryDayDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "long",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00Z`));
}

export function dateRangeLabel(startDate: string, endDate: string | null) {
  if (!endDate || endDate === startDate) {
    return formatTripDate(startDate);
  }

  return `${formatTripDate(startDate)} - ${formatTripDate(endDate)}`;
}

export function buildDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((end.getTime() - start.getTime()) / msPerDay);

  return Array.from({ length: totalDays + 1 }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);

    return day.toISOString().slice(0, 10);
  });
}
