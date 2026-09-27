"use client";

interface NumberInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  placeholder: string;
  unit: string;
  helpText?: string;
}

export function getNumberError(value: string, maximum: number) {
  if (value === "") return null;

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return "Enter a number.";
  if (parsedValue < 0) return "Enter zero or a positive number.";
  if (parsedValue > maximum) return `Enter a value of ${maximum} or less.`;

  return null;
}

export function NumberInput({
  id,
  label,
  value,
  onChange,
  max,
  placeholder,
  unit,
  helpText,
}: NumberInputProps) {
  const error = getNumberError(value, max);
  const describedBy = [helpText ? `${id}-help` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="block text-base font-bold leading-7 text-ink">
        {label}
      </label>
      {helpText ? (
        <p id={`${id}-help`} className="mt-1 text-sm leading-5 text-slate">
          {helpText}
        </p>
      ) : null}
      <div className="relative mt-3 max-w-md">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step="any"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className="h-14 w-full rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink shadow-sm outline-none transition placeholder:text-mist focus:border-teal focus:ring-4 focus:ring-teal/15 sm:pr-36"
        />
        <span className="pointer-events-none mt-2 block px-1 text-sm text-slate sm:absolute sm:inset-y-0 sm:right-3 sm:mt-0 sm:flex sm:items-center sm:px-0">
          {unit}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
