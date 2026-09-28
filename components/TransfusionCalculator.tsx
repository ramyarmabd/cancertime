"use client";

import { useMemo, useState } from "react";
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
import { calculateVisitTimeRange } from "@/lib/calculations";
import {
  emptyVisitForm,
  visitFormToInput,
  type VisitFormFields,
} from "@/lib/form-values";
import { formatNumber, formatScheduleRange } from "@/lib/formatting";

interface TransfusionCalculatorProps {
  fields: VisitFormFields;
  onFieldsChange: (fields: VisitFormFields) => void;
  rangeFields: ScheduleRangeFields;
  onRangeFieldsChange: (fields: ScheduleRangeFields) => void;
}

export function TransfusionCalculator({
  fields,
  onFieldsChange,
  rangeFields,
  onRangeFieldsChange,
}: TransfusionCalculatorProps) {
  const [accompanied, setAccompanied] = useState(false);
  const input = useMemo(() => visitFormToInput(fields), [fields]);
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
    return calculateVisitTimeRange(input, scheduleRange);
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
      ? "hours/month"
      : rangeFields.mode === "year"
        ? "hours/year"
        : "hours total";

  function reset() {
    onFieldsChange(emptyVisitForm);
    onRangeFieldsChange(emptyScheduleRange);
    setAccompanied(false);
  }

  const copyText =
    result && input
      ? `CancerTime transfusion estimate\n\nVisit frequency: ${formatNumber(input.visitsPerMonth)} visits per month on average\nTime at the center: ${formatNumber(input.centerHoursPerVisit)} hours per visit\nRound-trip travel: ${formatNumber(input.travelHoursPerVisit)} hours per visit\nEstimate period: ${selectedPeriod}\n\nEstimated time: ${formatNumber(result.totalHours)} ${selectedTotalLabel}\nApproximately ${formatNumber(result.eightHourDays)} eight-hour days\n\n${formatNumber(result.centerHoursInRange)} center hours\n${formatNumber(result.travelHoursInRange)} travel hours${accompanied ? `\n${formatNumber(result.totalHours)} accompanying caregiver-hours\n${formatNumber(result.totalHours * 2)} combined person-hours` : ""}\n\nGenerated using CancerTime.`
      : "";

  return (
    <div>
      <div className="mb-5 max-w-3xl">
        <p className="section-kicker">Transfusion time</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Estimate a transfusion schedule
        </h2>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
        <form onSubmit={(event) => event.preventDefault()} className="rounded-[2rem] border border-line/70 bg-surface p-5 shadow-sm min-[375px]:p-6 sm:p-7">
          <div className="space-y-7">
            <FrequencyInput
              id="transfusion-frequency"
              label="Transfusion visits"
              helpText="Enter how often a typical transfusion visit occurs."
              fields={fields.frequency}
              onChange={(frequency) => onFieldsChange({ ...fields, frequency })}
            />
            <DurationInput
              id="transfusion-center"
              label="Time at the center"
              helpText="Include check-in, waiting, and transfusion time for one visit."
              fields={fields.center}
              onChange={(center) => onFieldsChange({ ...fields, center })}
            />
            <DurationInput
              id="transfusion-travel"
              label="Round-trip travel"
              helpText="Total travel time to and from the transfusion center."
              fields={fields.travel}
              onChange={(travel) => onFieldsChange({ ...fields, travel })}
            />
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line/80 bg-wash/25 p-4">
              <input type="checkbox" checked={accompanied} onChange={(event) => setAccompanied(event.target.checked)} className="mt-0.5 size-5 accent-teal" />
              <span>
                <span className="block font-bold text-ink">A caregiver usually accompanies me</span>
                <span className="mt-1 block text-sm leading-6 text-slate">Shows caregiver time and combined person-hours.</span>
              </span>
            </label>
            <ScheduleRangeInput
              id="transfusion-range"
              fields={rangeFields}
              onChange={onRangeFieldsChange}
              combinationError={rangeConflict ? "A visit-based course needs more than 0 visits per month." : null}
            />
          </div>
          <button type="button" onClick={reset} className="button-secondary mt-7">Reset calculator</button>
        </form>

        {result ? (
          <ResultCard
            eyebrow="Your transfusion estimate"
            periodLabel={selectedPeriod}
            totalHours={result.totalHours}
            totalLabel={selectedTotalLabel}
            eightHourDays={result.eightHourDays}
            metrics={[
              { label: "Monthly average", value: `${formatNumber(result.hoursPerMonth)} hr` },
              { label: "Visits in period", value: formatNumber(result.visitsInRange) },
              { label: "Center time", value: `${formatNumber(result.centerHoursInRange)} hr` },
              { label: "Travel time", value: `${formatNumber(result.travelHoursInRange)} hr` },
            ]}
            breakdown={[
              { label: "Center", value: result.centerHoursInRange },
              { label: "Travel", value: result.travelHoursInRange, color: "navy" },
            ]}
            breakdownHeading="Where the time goes"
            copyText={copyText}
          >
            {accompanied ? (
              <div className="mt-7 rounded-3xl bg-gold/25 p-5 sm:p-6">
                <p className="text-sm font-bold text-ink">Accompanying caregiver time</p>
                <p className="mt-1 text-2xl font-bold text-ink">{formatNumber(result.totalHours)} caregiver-hours</p>
                <p className="mt-4 text-sm font-bold text-ink">Patient + caregiver</p>
                <p className="mt-1 text-xl font-bold text-ink">{formatNumber(result.totalHours * 2)} person-hours</p>
                <p className="mt-2 text-xs leading-5 text-slate">Person-hours combine each person’s time; they do not mean the patient personally spends this amount.</p>
              </div>
            ) : null}
          </ResultCard>
        ) : (
          <ResultPlaceholder prompt="Enter the visit frequency, center time, and travel time to see your estimate." />
        )}
      </div>
    </div>
  );
}
