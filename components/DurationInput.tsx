"use client";

import type { DurationFields } from "@/lib/form-values";

interface DurationInputProps {
  id: string;
  label: string;
  helpText: string;
  fields: DurationFields;
  onChange: (fields: DurationFields) => void;
  maximumHours?: number;
}

export function DurationInput({
  id,
  label,
  helpText,
  fields,
  onChange,
  maximumHours = 24,
}: DurationInputProps) {
  const hours = fields.hours === "" ? 0 : Number(fields.hours);
  const minutes = fields.minutes === "" ? 0 : Number(fields.minutes);
  const hasValue = fields.hours !== "" || fields.minutes !== "";
  const error =
    hasValue &&
    (!Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      hours < 0 ||
      minutes < 0 ||
      minutes > 59 ||
      hours + minutes / 60 > maximumHours)
      ? `Enter a valid duration no longer than ${maximumHours} hours.`
      : null;

  return (
    <fieldset>
      <legend className="text-base font-bold leading-7 text-ink">{label}</legend>
      <p id={`${id}-help`} className="mt-1 text-sm leading-5 text-slate">
        {helpText}
      </p>
      <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
        <label className="relative">
          <span className="sr-only">{label} hours</span>
          <input
            id={`${id}-hours`}
            type="number"
            inputMode="numeric"
            min={0}
            max={maximumHours}
            step={1}
            value={fields.hours}
            placeholder="1"
            onChange={(event) => onChange({ ...fields, hours: event.target.value })}
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
            className="h-14 w-full rounded-2xl border border-line bg-surface px-4 pr-16 text-base font-semibold text-ink shadow-sm outline-none transition placeholder:text-mist focus:border-teal focus:ring-4 focus:ring-teal/15"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate">hr</span>
        </label>
        <label className="relative">
          <span className="sr-only">{label} minutes</span>
          <input
            id={`${id}-minutes`}
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            step={1}
            value={fields.minutes}
            placeholder="30"
            onChange={(event) => onChange({ ...fields, minutes: event.target.value })}
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
            className="h-14 w-full rounded-2xl border border-line bg-surface px-4 pr-16 text-base font-semibold text-ink shadow-sm outline-none transition placeholder:text-mist focus:border-teal focus:ring-4 focus:ring-teal/15"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate">min</span>
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
