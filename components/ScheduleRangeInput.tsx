"use client";

import { getNumberError } from "@/components/NumberInput";
import {
  RANGE_LIMITS,
  type ScheduleRange,
  type ScheduleRangeUnit,
} from "@/lib/calculations";

export interface ScheduleRangeFields {
  enabled: boolean;
  value: string;
  unit: ScheduleRangeUnit;
}

export const emptyScheduleRange: ScheduleRangeFields = {
  enabled: false,
  value: "",
  unit: "months",
};

export function parseScheduleRange(
  fields: ScheduleRangeFields,
): ScheduleRange | null {
  if (
    !fields.enabled ||
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
}

export function ScheduleRangeInput({
  id,
  fields,
  onChange,
  combinationError,
}: ScheduleRangeInputProps) {
  const valueError = fields.enabled
    ? fields.value === ""
      ? "Enter when this schedule ends."
      : getNumberError(fields.value, RANGE_LIMITS[fields.unit])
    : null;
  const error = combinationError || valueError;
  const errorId = `${id}-error`;

  return (
    <fieldset className="rounded-3xl border border-line/80 bg-wash/30 p-5 sm:p-6">
      <legend className="sr-only">Schedule end point</legend>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={fields.enabled}
          onChange={(event) =>
            onChange({ ...fields, enabled: event.target.checked })
          }
          className="mt-0.5 size-5 shrink-0 accent-teal"
        />
        <span>
          <span className="block font-bold text-ink">
            This schedule has an end point
          </span>
          <span className="mt-1 block text-sm leading-6 text-slate">
            Leave this off to view a one-year estimate.
          </span>
        </span>
      </label>

      {fields.enabled ? (
        <div className="mt-5 border-t border-line/80 pt-5">
          <label
            htmlFor={`${id}-value`}
            className="block text-sm font-bold text-ink"
          >
            Schedule ends after
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
              onChange={(event) =>
                onChange({ ...fields, value: event.target.value })
              }
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : `${id}-help`}
              className="h-14 min-w-0 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink shadow-sm outline-none transition placeholder:text-mist focus:border-teal focus:ring-4 focus:ring-teal/15"
            />
            <select
              aria-label="Schedule end unit"
              value={fields.unit}
              onChange={(event) =>
                onChange({
                  ...fields,
                  unit: event.target.value as ScheduleRangeUnit,
                })
              }
              className="h-14 min-w-0 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink shadow-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/15"
            >
              <option value="visits">visits</option>
              <option value="weeks">weeks</option>
              <option value="months">months</option>
              <option value="years">years</option>
            </select>
          </div>
          <p id={`${id}-help`} className="mt-3 text-sm leading-6 text-slate">
            Change the unit at any time. Estimates update automatically.
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
