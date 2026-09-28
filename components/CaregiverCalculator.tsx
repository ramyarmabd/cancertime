"use client";

import { useMemo } from "react";
import { DurationInput } from "@/components/DurationInput";
import { FrequencyInput } from "@/components/FrequencyInput";
import { ResultCard } from "@/components/ResultCard";
import { ResultPlaceholder } from "@/components/ResultPlaceholder";
import {
  ScheduleRangeInput,
  emptyScheduleRange,
  parseScheduleRange,
  type ScheduleRangeFields,
} from "@/components/ScheduleRangeInput";
import {
  INPUT_LIMITS,
  calculateCaregiverTimeRange,
} from "@/lib/calculations";
import {
  durationFieldsToHours,
  emptyCaregiverForm,
  frequencyFieldsToVisitsPerMonth,
  type CaregiverFormFields,
} from "@/lib/form-values";
import { formatNumber, formatScheduleRange } from "@/lib/formatting";

interface CaregiverCalculatorProps {
  fields: CaregiverFormFields;
  onFieldsChange: (fields: CaregiverFormFields) => void;
  rangeFields: ScheduleRangeFields;
  onRangeFieldsChange: (fields: ScheduleRangeFields) => void;
}

export function CaregiverCalculator({
  fields,
  onFieldsChange,
  rangeFields,
  onRangeFieldsChange,
}: CaregiverCalculatorProps) {
  const input = useMemo(() => {
    const visitsPerMonth = frequencyFieldsToVisitsPerMonth(fields.frequency);
    const hoursPerVisit = durationFieldsToHours(fields.visit);
    const additionalHoursPerWeek = durationFieldsToHours(
      fields.additional,
      INPUT_LIMITS.additionalHoursPerWeek,
    );
    if (
      visitsPerMonth === null ||
      hoursPerVisit === null ||
      additionalHoursPerWeek === null
    ) {
      return null;
    }
    return { visitsPerMonth, hoursPerVisit, additionalHoursPerWeek };
  }, [fields]);
  const scheduleRange = useMemo(() => parseScheduleRange(rangeFields), [rangeFields]);
  const rangeConflict = Boolean(
    input &&
      rangeFields.mode === "course" &&
      rangeFields.unit === "visits" &&
      Number(rangeFields.value) > 0 &&
      input.visitsPerMonth === 0,
  );
  const result = useMemo(() => {
    if (!input || !scheduleRange || rangeConflict) return null;
    return calculateCaregiverTimeRange(input, scheduleRange);
  }, [input, scheduleRange, rangeConflict]);
  const selectedPeriod =
    rangeFields.mode === "month"
      ? "1 month"
      : rangeFields.mode === "year"
        ? "1 year"
        : scheduleRange
          ? `Defined course · ${formatScheduleRange(scheduleRange.value, scheduleRange.unit)}`
          : undefined;
  const selectedTotalLabel =
    rangeFields.mode === "month"
      ? "caregiver-hours/month"
      : rangeFields.mode === "year"
        ? "caregiver-hours/year"
        : "caregiver-hours total";

  function reset() {
    onFieldsChange(emptyCaregiverForm);
    onRangeFieldsChange(emptyScheduleRange);
  }

  const copyText =
    result && input
      ? `CancerTime caregiver estimate\n\nAccompanied visits: ${formatNumber(input.visitsPerMonth)} per month on average\nTime per accompanied visit: ${formatNumber(input.hoursPerVisit)} hours\nAdditional caregiving: ${formatNumber(input.additionalHoursPerWeek)} hours per week\nEstimate period: ${selectedPeriod}\n\nEstimated caregiver time: ${formatNumber(result.totalHours)} ${selectedTotalLabel}\nApproximately ${formatNumber(result.eightHourDays)} eight-hour days\n\n${formatNumber(result.visitHoursInRange)} visit-related hours\n${formatNumber(result.additionalHoursInRange)} additional caregiving hours\n\nGenerated using CancerTime.`
      : "";

  return (
    <div>
      <div className="mb-5 max-w-3xl">
        <p className="section-kicker">Caregiver time</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Estimate caregiver support
        </h2>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
        <form onSubmit={(event) => event.preventDefault()} className="rounded-[2rem] border border-line/70 bg-surface p-5 shadow-sm min-[375px]:p-6 sm:p-7">
          <div className="space-y-7">
            <FrequencyInput
              id="caregiver-frequency"
              label="Accompanied visits"
              helpText="How often does the caregiver attend a cancer-related visit?"
              fields={fields.frequency}
              onChange={(frequency) => onFieldsChange({ ...fields, frequency })}
            />
            <DurationInput
              id="caregiver-visit"
              label="Time per accompanied visit"
              helpText="Include the caregiver’s travel, waiting, and visit time."
              fields={fields.visit}
              onChange={(visit) => onFieldsChange({ ...fields, visit })}
            />
            <DurationInput
              id="caregiver-additional"
              label="Additional caregiving each week"
              helpText="For coordination, medication pickup, transportation, or help at home."
              fields={fields.additional}
              onChange={(additional) => onFieldsChange({ ...fields, additional })}
              maximumHours={INPUT_LIMITS.additionalHoursPerWeek}
            />
            <ScheduleRangeInput
              id="caregiver-range"
              fields={rangeFields}
              onChange={onRangeFieldsChange}
              combinationError={rangeConflict ? "A visit-based course needs more than 0 visits per month." : null}
            />
          </div>
          <button type="button" onClick={reset} className="button-secondary mt-7">Reset calculator</button>
        </form>

        {result ? (
          <ResultCard
            eyebrow="Your caregiver estimate"
            periodLabel={selectedPeriod}
            totalHours={result.totalHours}
            totalLabel={selectedTotalLabel}
            eightHourDays={result.eightHourDays}
            metrics={[
              { label: "Monthly average", value: `${formatNumber(result.hoursPerMonth)} hr` },
              { label: "Visits in period", value: formatNumber(result.visitsInRange) },
              { label: "Visit support", value: `${formatNumber(result.visitHoursInRange)} hr` },
              { label: "Other support", value: `${formatNumber(result.additionalHoursInRange)} hr` },
            ]}
            breakdown={[
              { label: "Visit support", value: result.visitHoursInRange },
              { label: "Other support", value: result.additionalHoursInRange, color: "navy" },
            ]}
            breakdownHeading="Where the time goes"
            copyText={copyText}
          />
        ) : (
          <ResultPlaceholder prompt="Enter the visit frequency, visit time, and additional weekly support to see your estimate." />
        )}
      </div>
    </div>
  );
}
