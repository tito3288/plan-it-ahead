function toUtcDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : value;

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function fixedDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day));
}

function observedFixedHoliday(year: number, monthIndex: number, day: number) {
  const date = fixedDate(year, monthIndex, day);
  const dow = date.getUTCDay();

  if (dow === 0) {
    return fixedDate(year, monthIndex, day + 1);
  }

  if (dow === 6) {
    return fixedDate(year, monthIndex, day - 1);
  }

  return date;
}

function nthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  nth: number
) {
  const first = fixedDate(year, monthIndex, 1);
  const offset = (weekday - first.getUTCDay() + 7) % 7;

  return fixedDate(year, monthIndex, 1 + offset + (nth - 1) * 7);
}

function lastWeekdayOfMonth(year: number, monthIndex: number, weekday: number) {
  const last = fixedDate(year, monthIndex + 1, 0);
  const offset = (last.getUTCDay() - weekday + 7) % 7;

  return fixedDate(year, monthIndex, last.getUTCDate() - offset);
}

function thanksgiving(year: number) {
  return nthWeekdayOfMonth(year, 10, 4, 4);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function holidayKeysForYear(year: number) {
  const dates = [
    observedFixedHoliday(year, 0, 1),
    nthWeekdayOfMonth(year, 0, 1, 3),
    nthWeekdayOfMonth(year, 1, 1, 3),
    lastWeekdayOfMonth(year, 4, 1),
    observedFixedHoliday(year, 5, 19),
    observedFixedHoliday(year, 6, 4),
    nthWeekdayOfMonth(year, 8, 1, 1),
    nthWeekdayOfMonth(year, 9, 1, 2),
    observedFixedHoliday(year, 10, 11),
    thanksgiving(year),
    addDays(thanksgiving(year), 1),
    observedFixedHoliday(year, 11, 25)
  ];

  return new Set(dates.map(dateKey));
}

// TODO(phase-later): replace this small US holiday helper with a maintained calendar library.
export function isUsHoliday(value: Date | string) {
  const date = toUtcDate(value);
  const year = date.getUTCFullYear();
  const holidays = new Set([
    ...Array.from(holidayKeysForYear(year - 1)),
    ...Array.from(holidayKeysForYear(year)),
    ...Array.from(holidayKeysForYear(year + 1))
  ]);

  return holidays.has(dateKey(date));
}

export function isWeekend(value: Date | string) {
  const day = toUtcDate(value).getUTCDay();

  return day === 0 || day === 6;
}
