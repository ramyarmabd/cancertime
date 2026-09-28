"use client";

import type { FrequencyFields } from "@/lib/form-values";
import { frequencyFieldsToVisitsPerMonth } from "@/lib/form-values";

interface FrequencyInputProps {
  id: string;
  label: string;
  helpText: string;
  fields: FrequencyFields;
  onChange: (fields: FrequencyFields) => void;
}

export function FrequencyInput({
  id,
  label,
  helpText,
  fields,
  onChange,
}: FrequencyInputProps) {
  const parsed = Number(fields.value);
  const error = fields.value !== "" &&
    (!Number.isFinite(parsed) ||
      parsed < 0 ||
      parsed > 100 ||
      frequencyFieldsToVisitsPerMonth(fields) === null)
      ? "Enter a number from 0 to 100."
      : null;

  return (
    <div>
      <label htmlFor={`${id}-value`} className="block text-base font-bold leading-7 text-ink">
        {label}
      </label>
      <p id={`${id}-help`} className="mt-1 text-sm leading-5 text-slate">
        {helpText}
      </p>
      <div className="mt-3 grid max-w-xl grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-3">
        <input
          id={`${id}-value`}
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step="any"
          value={fields.value}
          placeholder="1"
          onChange={(event) => onChange({ ...fields, value: event.target.value })}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
          className="h-14 min-w-0 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink shadow-sm outline-none transition placeholder:text-mist focus:border-teal focus:ring-4 focus:ring-teal/15"
        />
        <select
          aria-label={`${label} frequency`}
          value={fields.unit}
          onChange={(event) =>
            onChange({
              ...fields,
              unit: event.target.value as FrequencyFields["unit"],
            })
          }
          className="h-14 min-w-0 rounded-2xl border border-line bg-surface px-3 text-sm font-semibold text-ink shadow-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/15 sm:px-4 sm:text-base"
        >
          <option value="week">visit(s) each week</option>
          <option value="two-weeks">visit(s) every 2 weeks</option>
          <option value="three-weeks">visit(s) every 3 weeks</option>
          <option value="month">visit(s) each month</option>
        </select>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
