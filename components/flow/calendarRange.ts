export type DateRange = {
  end: string | null;
  start: string | null;
};

export function getNextDateRange(
  range: DateRange,
  selectedDate: string,
  today: string
): DateRange {
  if (selectedDate < today) {
    return range;
  }

  if (!range.start) {
    return { end: null, start: selectedDate };
  }

  if (!range.end) {
    if (selectedDate < range.start) {
      return { end: range.start, start: selectedDate };
    }

    return { end: selectedDate, start: range.start };
  }

  if (selectedDate > range.start) {
    return { end: selectedDate, start: range.start };
  }

  return { end: null, start: selectedDate };
}

export function isDateInRange(range: DateRange, date: string) {
  if (!range.start || !range.end) {
    return false;
  }

  return date > range.start && date < range.end;
}
