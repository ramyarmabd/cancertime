"use client";

import { getNumberError } from "@/components/NumberInput";
import {
  RANGE_LIMITS,
  type ScheduleRange,
  type ScheduleRangeUnit,
} from "@/lib/calculations";

export type EstimatePeriodMode = "month" | "year" | "course";

export interface ScheduleRangeFields {
  mode: EstimatePeriodMode;
  value: string;
  unit: ScheduleRangeUnit;
}

export const emptyScheduleRange: ScheduleRangeFields = {
  mode: "year",
  value: "",
  unit: "months",
};

export function parseScheduleRange(
  fields: ScheduleRangeFields,
): ScheduleRange | null {
  if (fields.mode === "month") return { value: 1, unit: "months" };
  if (fields.mode === "year") return { value: 1, unit: "years" };
  if (
    fields.value === "" ||
    getNumberError(fields.value, RANGE_LIMITS[fields.unit])
  ) {
    return null;
  }

  return { value: Number(fields.value), unit: fields.unit };
}

interface ScheduleRangeInputProps {
  id: string;
  fields: ScheduleRangeFields;
  onChange: (fields: ScheduleRangeFields) => void;
  combinationError?: string | null;
  allowVisits?: boolean;
}

const periodOptions: Array<{
  value: EstimatePeriodMode;
  label: string;
  hint: string;
}> = [
  { value: "month", label: "1 month", hint: "Short-term view" },
  { value: "year", label: "1 year", hint: "Annual view" },
  { value: "course", label: "Defined course", hint: "Choose an end point" },
];

export function ScheduleRangeInput({
  id,
  fields,
  onChange,
  combinationError,
  allowVisits = true,
}: ScheduleRangeInputProps) {
  const valueError =
    fields.mode === "course"
      ? fields.value === ""
        ? "Enter when this course ends."
        : getNumberError(fields.value, RANGE_LIMITS[fields.unit])
      : null;
  const error = combinationError || valueError;
  const errorId = `${id}-error`;

  return (
    <fieldset>
      <legend className="text-base font-bold leading-7 text-ink">Estimate for</legend>
      <p className="mt-1 text-sm leading-5 text-slate">
        Choose the period you want the total to cover.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 min-[430px]:grid-cols-3">
        {periodOptions.map((option) => {
          const selected = fields.mode === option.value;
          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-2xl border px-4 py-3 outline-none transition focus-within:ring-4 focus-within:ring-teal/15 ${
                selected
                  ? "border-action bg-action text-white"
                  : "border-line bg-surface text-ink hover:border-teal"
              }`}
            >
              <input
                type="radio"
                name={`${id}-period`}
                value={option.value}
                checked={selected}
                onChange={() => onChange({ ...fields, mode: option.value })}
                className="sr-only"
              />
              <span className="block text-sm font-bold">{option.label}</span>
              <span className={`mt-0.5 block text-xs ${selected ? "text-white/75" : "text-slate"}`}>
                {option.hint}
              </span>
            </label>
          );
        })}
      </div>

      {fields.mode === "course" ? (
        <div className="mt-4 rounded-2xl border border-line/80 bg-wash/25 p-4">
          <label htmlFor={`${id}-value`} className="block text-sm font-bold text-ink">
            Course ends after
          </label>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(8.5rem,0.72fr)]">
            <input
              id={`${id}-value`}
              type="number"
              inputMode="decimal"
              min={0}
              max={RANGE_LIMITS[fields.unit]}
              step="any"
              value={fields.value}
              placeholder={fields.unit === "visits" ? "12" : "6"}
              onChange={(event) => onChange({ ...fields, value: event.target.value })}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : `${id}-help`}
              className="h-14 min-w-0 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink shadow-sm outline-none transition placeholder:text-mist focus:border-teal focus:ring-4 focus:ring-teal/15"
            />
            <select
              aria-label="Course end unit"
              value={fields.unit}
              onChange={(event) =>
                onChange({
                  ...fields,
                  unit: event.target.value as ScheduleRangeUnit,
                })
              }
              className="h-14 min-w-0 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink shadow-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/15"
            >
              {allowVisits ? <option value="visits">visits</option> : null}
              <option value="weeks">weeks</option>
              <option value="months">months</option>
              <option value="years">years</option>
            </select>
          </div>
          <p id={`${id}-help`} className="mt-3 text-sm leading-6 text-slate">
            Change the unit at any time. The estimate updates automatically.
          </p>
          {error ? (
            <p id={errorId} role="alert" className="mt-2 text-sm font-semibold text-error">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}
