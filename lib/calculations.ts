export interface VisitTimeInput {
  visitsPerMonth: number;
  centerHoursPerVisit: number;
  travelHoursPerVisit: number;
}

export type VisitFrequencyUnit =
  | "week"
  | "two-weeks"
  | "three-weeks"
  | "month";

export interface VisitFrequencyInput {
  value: number;
  unit: VisitFrequencyUnit;
}

export interface VisitTimeResult {
  visitsPerYear: number;
  centerHoursPerYear: number;
  travelHoursPerYear: number;
  totalHoursPerYear: number;
  hoursPerMonth: number;
  eightHourDays: number;
}

export interface CaregiverTimeInput {
  visitsPerMonth: number;
  hoursPerVisit: number;
  additionalHoursPerWeek: number;
}

export interface CaregiverTimeResult {
  visitHoursPerYear: number;
  additionalHoursPerYear: number;
  totalHoursPerYear: number;
  hoursPerMonth: number;
  eightHourDays: number;
}

export type ScheduleRangeUnit = "visits" | "weeks" | "months" | "years";

export interface ScheduleRange {
  value: number;
  unit: ScheduleRangeUnit;
}

export interface VisitTimeRangeResult {
  visitsInRange: number;
  centerHoursInRange: number;
  travelHoursInRange: number;
  totalHours: number;
  hoursPerMonth: number;
  eightHourDays: number;
  durationMonths: number;
}

export interface CaregiverTimeRangeResult {
  visitsInRange: number;
  visitHoursInRange: number;
  additionalHoursInRange: number;
  totalHours: number;
  hoursPerMonth: number;
  eightHourDays: number;
  durationMonths: number;
}

export interface CarePlanActivityInput extends VisitTimeInput {
  label: string;
  sharesTravel: boolean;
}

export interface CarePlanActivityResult {
  label: string;
  visits: number;
  centerHours: number;
  travelHours: number;
  totalHours: number;
  sharesTravel: boolean;
}

export interface CombinedCarePlanResult {
  activities: CarePlanActivityResult[];
  activityOccurrences: number;
  centerHours: number;
  travelHours: number;
  totalHours: number;
  hoursPerMonth: number;
  eightHourDays: number;
  durationMonths: number;
}

export const INPUT_LIMITS = {
  visitsPerMonth: 100,
  hoursPerVisit: 24,
  travelHoursPerVisit: 24,
  additionalHoursPerWeek: 168,
} as const;

export const RANGE_LIMITS: Record<ScheduleRangeUnit, number> = {
  visits: 10_000,
  weeks: 520,
  months: 120,
  years: 10,
};

function assertInRange(value: number, name: string, maximum: number) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }

  if (value < 0 || value > maximum) {
    throw new RangeError(`${name} must be between 0 and ${maximum}.`);
  }
}

export function frequencyToVisitsPerMonth(input: VisitFrequencyInput) {
  assertInRange(input.value, "Visit frequency", INPUT_LIMITS.visitsPerMonth);
  const monthly =
    input.unit === "week"
      ? input.value * (52 / 12)
      : input.unit === "two-weeks"
        ? input.value * (26 / 12)
        : input.unit === "three-weeks"
          ? input.value * (52 / 36)
          : input.value;
  assertInRange(monthly, "Average visits per month", INPUT_LIMITS.visitsPerMonth);
  return monthly;
}

function validateVisitInput(input: VisitTimeInput) {
  assertInRange(
    input.visitsPerMonth,
    "Visits per month",
    INPUT_LIMITS.visitsPerMonth,
  );
  assertInRange(
    input.centerHoursPerVisit,
    "Center hours per visit",
    INPUT_LIMITS.hoursPerVisit,
  );
  assertInRange(
    input.travelHoursPerVisit,
    "Travel hours per visit",
    INPUT_LIMITS.travelHoursPerVisit,
  );
}

function validateCaregiverInput(input: CaregiverTimeInput) {
  assertInRange(
    input.visitsPerMonth,
    "Visits per month",
    INPUT_LIMITS.visitsPerMonth,
  );
  assertInRange(
    input.hoursPerVisit,
    "Hours per visit",
    INPUT_LIMITS.hoursPerVisit,
  );
  assertInRange(
    input.additionalHoursPerWeek,
    "Additional hours per week",
    INPUT_LIMITS.additionalHoursPerWeek,
  );
}

export function rangeDurationMonths(
  range: ScheduleRange,
  visitsPerMonth: number,
) {
  assertInRange(range.value, "Schedule range", RANGE_LIMITS[range.unit]);

  if (range.unit === "visits") {
    if (range.value > 0 && visitsPerMonth === 0) {
      throw new RangeError(
        "A visit-based end point requires more than zero visits per month.",
      );
    }

    return range.value === 0 ? 0 : range.value / visitsPerMonth;
  }

  if (range.unit === "weeks") return range.value * (12 / 52);
  if (range.unit === "years") return range.value * 12;
  return range.value;
}

function calculateVisitTime(input: VisitTimeInput): VisitTimeResult {
  validateVisitInput(input);

  const visitsPerYear = input.visitsPerMonth * 12;
  const centerHoursPerYear = visitsPerYear * input.centerHoursPerVisit;
  const travelHoursPerYear = visitsPerYear * input.travelHoursPerVisit;
  const totalHoursPerYear = centerHoursPerYear + travelHoursPerYear;

  return {
    visitsPerYear,
    centerHoursPerYear,
    travelHoursPerYear,
    totalHoursPerYear,
    hoursPerMonth: totalHoursPerYear / 12,
    eightHourDays: totalHoursPerYear / 8,
  };
}

export function calculateTreatmentTime(
  input: VisitTimeInput,
): VisitTimeResult {
  return calculateVisitTime(input);
}

export function calculateTransfusionTime(
  input: VisitTimeInput,
): VisitTimeResult {
  return calculateVisitTime(input);
}

export function calculateVisitTimeRange(
  input: VisitTimeInput,
  range: ScheduleRange,
): VisitTimeRangeResult {
  validateVisitInput(input);
  const durationMonths = rangeDurationMonths(range, input.visitsPerMonth);
  const visitsInRange =
    range.unit === "visits"
      ? range.value
      : input.visitsPerMonth * durationMonths;
  const centerHoursInRange = visitsInRange * input.centerHoursPerVisit;
  const travelHoursInRange = visitsInRange * input.travelHoursPerVisit;
  const totalHours = centerHoursInRange + travelHoursInRange;

  return {
    visitsInRange,
    centerHoursInRange,
    travelHoursInRange,
    totalHours,
    hoursPerMonth: durationMonths === 0 ? 0 : totalHours / durationMonths,
    eightHourDays: totalHours / 8,
    durationMonths,
  };
}

export function calculateCaregiverTime(
  input: CaregiverTimeInput,
): CaregiverTimeResult {
  validateCaregiverInput(input);

  const visitHoursPerYear =
    input.visitsPerMonth * input.hoursPerVisit * 12;
  const additionalHoursPerYear = input.additionalHoursPerWeek * 52;
  const totalHoursPerYear = visitHoursPerYear + additionalHoursPerYear;

  return {
    visitHoursPerYear,
    additionalHoursPerYear,
    totalHoursPerYear,
    hoursPerMonth: totalHoursPerYear / 12,
    eightHourDays: totalHoursPerYear / 8,
  };
}

export function calculateCaregiverTimeRange(
  input: CaregiverTimeInput,
  range: ScheduleRange,
): CaregiverTimeRangeResult {
  validateCaregiverInput(input);
  const durationMonths = rangeDurationMonths(range, input.visitsPerMonth);
  const visitsInRange =
    range.unit === "visits"
      ? range.value
      : input.visitsPerMonth * durationMonths;
  const visitHoursInRange = visitsInRange * input.hoursPerVisit;
  const durationWeeks = durationMonths * (52 / 12);
  const additionalHoursInRange =
    input.additionalHoursPerWeek * durationWeeks;
  const totalHours = visitHoursInRange + additionalHoursInRange;

  return {
    visitsInRange,
    visitHoursInRange,
    additionalHoursInRange,
    totalHours,
    hoursPerMonth: durationMonths === 0 ? 0 : totalHours / durationMonths,
    eightHourDays: totalHours / 8,
    durationMonths,
  };
}

export function calculateCombinedCarePlan(
  activities: CarePlanActivityInput[],
  range: ScheduleRange,
): CombinedCarePlanResult {
  if (range.unit === "visits") {
    throw new RangeError(
      "A combined care plan must use weeks, months, or years for its estimate period.",
    );
  }

  const durationMonths = rangeDurationMonths(range, 0);
  const activityResults = activities.map((activity) => {
    validateVisitInput(activity);
    const visits = activity.visitsPerMonth * durationMonths;
    const centerHours = visits * activity.centerHoursPerVisit;
    const travelHours = activity.sharesTravel
      ? 0
      : visits * activity.travelHoursPerVisit;

    return {
      label: activity.label,
      visits,
      centerHours,
      travelHours,
      totalHours: centerHours + travelHours,
      sharesTravel: activity.sharesTravel,
    };
  });

  const activityOccurrences = activityResults.reduce(
    (sum, activity) => sum + activity.visits,
    0,
  );
  const centerHours = activityResults.reduce(
    (sum, activity) => sum + activity.centerHours,
    0,
  );
  const travelHours = activityResults.reduce(
    (sum, activity) => sum + activity.travelHours,
    0,
  );
  const totalHours = centerHours + travelHours;

  return {
    activities: activityResults,
    activityOccurrences,
    centerHours,
    travelHours,
    totalHours,
    hoursPerMonth: durationMonths === 0 ? 0 : totalHours / durationMonths,
    eightHourDays: totalHours / 8,
    durationMonths,
  };
}
