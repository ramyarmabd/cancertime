export type CalendarRepeat =
  | "once"
  | "week"
  | "two-weeks"
  | "three-weeks"
  | "month";

export type CalendarEnd =
  | { mode: "count"; count: number }
  | { mode: "date"; endDate: string };

export interface CalendarEventInput {
  id: string;
  date: string;
  category: string;
  title: string;
  centerHours: number;
  travelHours: number;
}

export interface CalendarCategoryTotal {
  category: string;
  appointments: number;
  hours: number;
}

export interface CalendarPlanResult {
  appointments: number;
  centerHours: number;
  travelHours: number;
  totalHours: number;
  eightHourDays: number;
  firstDate: string;
  lastDate: string;
  categories: CalendarCategoryTotal[];
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_GENERATED_EVENTS = 200;

function parseIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new RangeError("Enter a valid calendar date.");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError("Enter a valid calendar date.");
  }
  return date;
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysInUtcMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function dateAtOccurrence(start: Date, repeat: CalendarRepeat, index: number) {
  if (repeat === "month") {
    const targetMonth = start.getUTCMonth() + index;
    const targetYear = start.getUTCFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    const day = Math.min(
      start.getUTCDate(),
      daysInUtcMonth(targetYear, normalizedMonth),
    );
    return new Date(Date.UTC(targetYear, normalizedMonth, day));
  }

  const intervalDays =
    repeat === "week" ? 7 : repeat === "two-weeks" ? 14 : repeat === "three-weeks" ? 21 : 0;
  const date = new Date(start);
  date.setUTCDate(date.getUTCDate() + intervalDays * index);
  return date;
}

export function generateScheduleDates(
  startDate: string,
  repeat: CalendarRepeat,
  end: CalendarEnd,
) {
  const start = parseIsoDate(startDate);
  if (repeat === "once") return [startDate];

  if (end.mode === "count") {
    if (!Number.isInteger(end.count) || end.count < 1 || end.count > MAX_GENERATED_EVENTS) {
      throw new RangeError(`The number of appointments must be between 1 and ${MAX_GENERATED_EVENTS}.`);
    }
    return Array.from({ length: end.count }, (_, index) =>
      formatIsoDate(dateAtOccurrence(start, repeat, index)),
    );
  }

  const last = parseIsoDate(end.endDate);
  if (last < start) {
    throw new RangeError("The end date must be on or after the first appointment.");
  }

  const dates: string[] = [];
  for (let index = 0; index < MAX_GENERATED_EVENTS; index += 1) {
    const occurrence = dateAtOccurrence(start, repeat, index);
    if (occurrence > last) break;
    dates.push(formatIsoDate(occurrence));
  }
  return dates;
}

function validateHours(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 24) {
    throw new RangeError("Appointment durations must be between 0 and 24 hours.");
  }
}

export function calculateCalendarPlan(events: CalendarEventInput[]): CalendarPlanResult | null {
  if (events.length === 0) return null;

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const categoryMap = new Map<string, CalendarCategoryTotal>();
  let centerHours = 0;
  let travelHours = 0;

  for (const event of sorted) {
    parseIsoDate(event.date);
    validateHours(event.centerHours);
    validateHours(event.travelHours);
    centerHours += event.centerHours;
    travelHours += event.travelHours;
    const category = categoryMap.get(event.category) ?? {
      category: event.category,
      appointments: 0,
      hours: 0,
    };
    category.appointments += 1;
    category.hours += event.centerHours + event.travelHours;
    categoryMap.set(event.category, category);
  }

  const totalHours = centerHours + travelHours;
  return {
    appointments: sorted.length,
    centerHours,
    travelHours,
    totalHours,
    eightHourDays: totalHours / 8,
    firstDate: sorted[0].date,
    lastDate: sorted[sorted.length - 1].date,
    categories: [...categoryMap.values()].sort((a, b) => b.hours - a.hours),
  };
}
