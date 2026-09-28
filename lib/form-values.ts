import {
  INPUT_LIMITS,
  frequencyToVisitsPerMonth,
  type VisitFrequencyUnit,
  type VisitTimeInput,
} from "@/lib/calculations";

export interface FrequencyFields {
  value: string;
  unit: VisitFrequencyUnit;
}

export interface DurationFields {
  hours: string;
  minutes: string;
}

export interface VisitFormFields {
  frequency: FrequencyFields;
  center: DurationFields;
  travel: DurationFields;
}

export interface CaregiverFormFields {
  frequency: FrequencyFields;
  visit: DurationFields;
  additional: DurationFields;
}

export const emptyFrequency: FrequencyFields = {
  value: "",
  unit: "month",
};

export const emptyDuration: DurationFields = { hours: "", minutes: "" };

export const emptyVisitForm: VisitFormFields = {
  frequency: { ...emptyFrequency },
  center: { ...emptyDuration },
  travel: { ...emptyDuration },
};

export const emptyCaregiverForm: CaregiverFormFields = {
  frequency: { ...emptyFrequency },
  visit: { ...emptyDuration },
  additional: { ...emptyDuration },
};

function parseNonNegative(value: string, maximum: number) {
  if (value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > maximum) return null;
  return parsed;
}

export function durationFieldsToHours(
  fields: DurationFields,
  maximumHours: number = INPUT_LIMITS.hoursPerVisit,
) {
  if (fields.hours === "" && fields.minutes === "") return null;

  const hours = fields.hours === "" ? 0 : parseNonNegative(fields.hours, maximumHours);
  const minutes = fields.minutes === "" ? 0 : parseNonNegative(fields.minutes, 59);
  if (hours === null || minutes === null) return null;

  const total = hours + minutes / 60;
  return total <= maximumHours ? total : null;
}

export function hoursToDurationFields(value: number): DurationFields {
  const roundedMinutes = Math.round(value * 60);
  return {
    hours: String(Math.floor(roundedMinutes / 60)),
    minutes: String(roundedMinutes % 60),
  };
}

export function frequencyFieldsToVisitsPerMonth(fields: FrequencyFields) {
  const value = parseNonNegative(fields.value, INPUT_LIMITS.visitsPerMonth);
  if (value === null) return null;
  try {
    return frequencyToVisitsPerMonth({ value, unit: fields.unit });
  } catch {
    return null;
  }
}

export function visitFormToInput(fields: VisitFormFields): VisitTimeInput | null {
  const visitsPerMonth = frequencyFieldsToVisitsPerMonth(fields.frequency);
  const centerHoursPerVisit = durationFieldsToHours(fields.center);
  const travelHoursPerVisit = durationFieldsToHours(fields.travel);

  if (
    visitsPerMonth === null ||
    centerHoursPerVisit === null ||
    travelHoursPerVisit === null
  ) {
    return null;
  }

  return { visitsPerMonth, centerHoursPerVisit, travelHoursPerVisit };
}

export function hasAnyVisitFormValue(fields: VisitFormFields) {
  return Boolean(
    fields.frequency.value ||
      fields.center.hours ||
      fields.center.minutes ||
      fields.travel.hours ||
      fields.travel.minutes,
  );
}
