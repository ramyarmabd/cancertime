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
import {
  calculateVisitTimeRange,
  type ScheduleRange,
  type VisitTimeInput,
} from "@/lib/calculations";
import {
  emptyVisitForm,
  visitFormToInput,
  type VisitFormFields,
} from "@/lib/form-values";
import {
  formatNumber,
  formatScheduleRange,
  formatSignedDifference,
} from "@/lib/formatting";

interface DisplayVisitResult {
  totalHours: number;
  hoursPerMonth: number;
  visits: number;
  centerHours: number;
  travelHours: number;
  eightHourDays: number;
}

function getDisplayResult(
  input: VisitTimeInput | null,
  range: ScheduleRange | null,
  rangeHasError: boolean,
): DisplayVisitResult | null {
  if (!input || !range || rangeHasError) return null;
  const result = calculateVisitTimeRange(input, range);
  return {
    totalHours: result.totalHours,
    hoursPerMonth: result.hoursPerMonth,
    visits: result.visitsInRange,
    centerHours: result.centerHoursInRange,
    travelHours: result.travelHoursInRange,
    eightHourDays: result.eightHourDays,
  };
}

function hasVisitRangeConflict(
  input: VisitTimeInput | null,
  fields: ScheduleRangeFields,
) {
  return Boolean(
    input &&
      fields.mode === "course" &&
      fields.unit === "visits" &&
      Number(fields.value) > 0 &&
      input.visitsPerMonth === 0,
  );
}

function periodLabel(fields: ScheduleRangeFields, range: ScheduleRange | null) {
  if (fields.mode === "month") return "1 month";
  if (fields.mode === "year") return "1 year";
  return range ? `Defined course · ${formatScheduleRange(range.value, range.unit)}` : undefined;
}

function totalLabel(fields: ScheduleRangeFields) {
  if (fields.mode === "month") return "hours/month";
  if (fields.mode === "year") return "hours/year";
  return "hours total";
}

interface TreatmentCalculatorProps {
  fields: VisitFormFields;
  onFieldsChange: (fields: VisitFormFields) => void;
  rangeFields: ScheduleRangeFields;
  onRangeFieldsChange: (fields: ScheduleRangeFields) => void;
}

export function TreatmentCalculator({
  fields,
  onFieldsChange,
  rangeFields,
  onRangeFieldsChange,
}: TreatmentCalculatorProps) {
  const [comparisonFields, setComparisonFields] = useState<VisitFormFields>(emptyVisitForm);
  const input = useMemo(() => visitFormToInput(fields), [fields]);
  const comparisonInput = useMemo(() => visitFormToInput(comparisonFields), [comparisonFields]);
  const scheduleRange = useMemo(() => parseScheduleRange(rangeFields), [rangeFields]);
  const rangeConflict = hasVisitRangeConflict(input, rangeFields);
  const comparisonRangeConflict = hasVisitRangeConflict(comparisonInput, rangeFields);
  const result = getDisplayResult(input, scheduleRange, rangeConflict);
  const comparisonResult = getDisplayResult(
    comparisonInput,
    scheduleRange,
    comparisonRangeConflict,
  );
  const selectedPeriod = periodLabel(rangeFields, scheduleRange);
  const selectedTotalLabel = totalLabel(rangeFields);

  function reset() {
    onFieldsChange(emptyVisitForm);
    onRangeFieldsChange(emptyScheduleRange);
    setComparisonFields(emptyVisitForm);
  }

  const copyText =
    result && input
      ? `CancerTime treatment estimate\n\nVisit frequency: ${formatNumber(input.visitsPerMonth)} visits per month on average\nTime at the center: ${formatNumber(input.centerHoursPerVisit)} hours per visit\nRound-trip travel: ${formatNumber(input.travelHoursPerVisit)} hours per visit\nEstimate period: ${selectedPeriod}\n\nEstimated time: ${formatNumber(result.totalHours)} ${selectedTotalLabel}\nApproximately ${formatNumber(result.eightHourDays)} eight-hour days\n\n${formatNumber(result.centerHours)} clinic hours\n${formatNumber(result.travelHours)} travel hours\n\nGenerated using CancerTime.`
      : "";

  return (
    <div>
      <div className="mb-5 max-w-3xl">
        <p className="section-kicker">Treatment time</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Estimate a treatment schedule
        </h2>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
        <form
          onSubmit={(event) => event.preventDefault()}
          className="rounded-[2rem] border border-line/70 bg-surface p-5 shadow-sm min-[375px]:p-6 sm:p-7"
        >
          <div className="space-y-7">
            <FrequencyInput
              id="treatment-frequency"
              label="Treatment visits"
              helpText="Enter how often a typical treatment visit occurs."
              fields={fields.frequency}
              onChange={(frequency) => onFieldsChange({ ...fields, frequency })}
            />
            <DurationInput
              id="treatment-center"
              label="Time at the center"
              helpText="Include treatment, check-in, and waiting time for one visit."
              fields={fields.center}
              onChange={(center) => onFieldsChange({ ...fields, center })}
            />
            <DurationInput
              id="treatment-travel"
              label="Round-trip travel"
              helpText="Total travel time to and from the treatment center."
              fields={fields.travel}
              onChange={(travel) => onFieldsChange({ ...fields, travel })}
            />
            <ScheduleRangeInput
              id="treatment-range"
              fields={rangeFields}
              onChange={onRangeFieldsChange}
              combinationError={
                rangeConflict
                  ? "A visit-based course needs more than 0 visits per month."
                  : null
              }
            />
          </div>
          <button type="button" onClick={reset} className="button-secondary mt-7">
            Reset calculator
          </button>
        </form>

        {result ? (
          <ResultCard
            eyebrow="Your treatment estimate"
            periodLabel={selectedPeriod}
            totalHours={result.totalHours}
            totalLabel={selectedTotalLabel}
            eightHourDays={result.eightHourDays}
            metrics={[
              { label: "Monthly average", value: `${formatNumber(result.hoursPerMonth)} hr` },
              { label: "Visits in period", value: formatNumber(result.visits) },
              { label: "Clinic time", value: `${formatNumber(result.centerHours)} hr` },
              { label: "Travel time", value: `${formatNumber(result.travelHours)} hr` },
            ]}
            breakdown={[
              { label: "Clinic", value: result.centerHours },
              { label: "Travel", value: result.travelHours, color: "navy" },
            ]}
            breakdownHeading="Where the time goes"
            copyText={copyText}
            footerAction={{
              href: "#treatment-comparison",
              label: "Compare another schedule",
              description: "See the difference using the same estimate period.",
            }}
          />
        ) : (
          <ResultPlaceholder prompt="Enter the visit frequency, center time, and travel time to see your estimate." />
        )}
      </div>

      <details id="treatment-comparison" className="group mt-8 scroll-mt-24 overflow-hidden rounded-[2rem] border border-line/70 bg-surface shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-bold text-ink outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-teal/20 sm:px-8">
          <span>
            <span className="block text-xl">Compare another schedule</span>
            <span className="mt-1 block text-sm font-normal text-slate">
              Uses the same estimate period as Schedule A
            </span>
          </span>
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-wash/45 text-2xl transition group-open:rotate-45">+</span>
        </summary>
        <div className="border-t border-line px-6 py-7 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <h3 className="font-serif text-2xl font-bold text-ink">Schedule B</h3>
              <div className="mt-5 space-y-6">
                <FrequencyInput
                  id="comparison-frequency"
                  label="Treatment visits"
                  helpText="How often does the comparison schedule occur?"
                  fields={comparisonFields.frequency}
                  onChange={(frequency) => setComparisonFields((current) => ({ ...current, frequency }))}
                />
                <DurationInput
                  id="comparison-center"
                  label="Time at the center"
                  helpText="Time for one comparison visit."
                  fields={comparisonFields.center}
                  onChange={(center) => setComparisonFields((current) => ({ ...current, center }))}
                />
                <DurationInput
                  id="comparison-travel"
                  label="Round-trip travel"
                  helpText="Travel time for one comparison visit."
                  fields={comparisonFields.travel}
                  onChange={(travel) => setComparisonFields((current) => ({ ...current, travel }))}
                />
              </div>
            </div>

            <div aria-live="polite">
              {result && comparisonResult ? (
                <div className="rounded-3xl bg-wash/45 p-6 sm:p-8">
                  <p className="section-kicker">Difference in estimated time burden</p>
                  <p className="mt-3 text-sm font-semibold text-slate">{selectedPeriod}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Schedule A", result.totalHours],
                      ["Schedule B", comparisonResult.totalHours],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-2xl bg-surface p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-ink">{formatNumber(Number(value))} <span className="text-sm font-medium">{selectedTotalLabel}</span></p>
                      </div>
                    ))}
                    <div className="rounded-2xl bg-surface p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate">Difference</p>
                      <p className="mt-2 text-lg font-bold leading-7 text-ink">
                        {formatSignedDifference(
                          comparisonResult.totalHours - result.totalHours,
                          selectedTotalLabel,
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-slate">
                    Equivalent difference: {formatNumber(Math.abs(comparisonResult.eightHourDays - result.eightHourDays))} eight-hour days.
                  </p>
                  <p className="mt-5 border-t border-line pt-5 text-sm leading-6 text-slate">
                    Time burden is only one consideration. CancerTime does not compare effectiveness, safety, or medical appropriateness.
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-line p-8 text-sm leading-6 text-slate">
                  {comparisonRangeConflict
                    ? "A visit-based course needs more than 0 visits per month in Schedule B."
                    : "Complete both schedules to compare their estimated time."}
                </div>
              )}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
