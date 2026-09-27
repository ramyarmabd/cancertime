"use client";

import { useMemo, useState } from "react";
import type { SharedVisitFields } from "@/components/CalculatorTabs";
import { NumberInput, getNumberError } from "@/components/NumberInput";
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
  calculateTreatmentTime,
  calculateVisitTimeRange,
  type ScheduleRange,
  type VisitTimeInput,
} from "@/lib/calculations";
import {
  formatNumber,
  formatScheduleRange,
  formatSignedDifference,
} from "@/lib/formatting";

type VisitFields = SharedVisitFields;

interface DisplayVisitResult {
  totalHours: number;
  hoursPerMonth: number;
  visits: number;
  centerHours: number;
  travelHours: number;
  eightHourDays: number;
}

const emptyFields: VisitFields = { visits: "", center: "", travel: "" };

function parseFields(fields: VisitFields): VisitTimeInput | null {
  if (
    fields.visits === "" ||
    fields.center === "" ||
    fields.travel === "" ||
    getNumberError(fields.visits, INPUT_LIMITS.visitsPerMonth) ||
    getNumberError(fields.center, INPUT_LIMITS.hoursPerVisit) ||
    getNumberError(fields.travel, INPUT_LIMITS.travelHoursPerVisit)
  ) {
    return null;
  }

  return {
    visitsPerMonth: Number(fields.visits),
    centerHoursPerVisit: Number(fields.center),
    travelHoursPerVisit: Number(fields.travel),
  };
}

function getDisplayResult(
  input: VisitTimeInput | null,
  rangeEnabled: boolean,
  range: ScheduleRange | null,
  rangeHasError: boolean,
): DisplayVisitResult | null {
  if (!input || rangeHasError) return null;

  if (rangeEnabled) {
    if (!range) return null;
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

  const result = calculateTreatmentTime(input);
  return {
    totalHours: result.totalHoursPerYear,
    hoursPerMonth: result.hoursPerMonth,
    visits: result.visitsPerYear,
    centerHours: result.centerHoursPerYear,
    travelHours: result.travelHoursPerYear,
    eightHourDays: result.eightHourDays,
  };
}

function hasVisitRangeConflict(
  input: VisitTimeInput | null,
  fields: ScheduleRangeFields,
) {
  return Boolean(
    input &&
      fields.enabled &&
      fields.unit === "visits" &&
      Number(fields.value) > 0 &&
      input.visitsPerMonth === 0,
  );
}

interface TreatmentCalculatorProps {
  fields: SharedVisitFields;
  onFieldsChange: (fields: SharedVisitFields) => void;
  rangeFields: ScheduleRangeFields;
  onRangeFieldsChange: (fields: ScheduleRangeFields) => void;
}

export function TreatmentCalculator({
  fields,
  onFieldsChange,
  rangeFields,
  onRangeFieldsChange,
}: TreatmentCalculatorProps) {
  const [comparisonFields, setComparisonFields] =
    useState<VisitFields>(emptyFields);

  const input = useMemo(() => parseFields(fields), [fields]);
  const comparisonInput = useMemo(
    () => parseFields(comparisonFields),
    [comparisonFields],
  );
  const scheduleRange = useMemo(
    () => parseScheduleRange(rangeFields),
    [rangeFields],
  );
  const rangeConflict = hasVisitRangeConflict(input, rangeFields);
  const comparisonRangeConflict = hasVisitRangeConflict(
    comparisonInput,
    rangeFields,
  );
  const result = getDisplayResult(
    input,
    rangeFields.enabled,
    scheduleRange,
    rangeConflict,
  );
  const comparisonResult = getDisplayResult(
    comparisonInput,
    rangeFields.enabled,
    scheduleRange,
    comparisonRangeConflict,
  );
  const periodLabel =
    rangeFields.enabled && scheduleRange
      ? `Ends after ${formatScheduleRange(scheduleRange.value, scheduleRange.unit)}`
      : undefined;

  function updateField(key: keyof VisitFields, value: string) {
    onFieldsChange({ ...fields, [key]: value });
  }

  function updateComparisonField(key: keyof VisitFields, value: string) {
    setComparisonFields((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    onFieldsChange(emptyFields);
    onRangeFieldsChange(emptyScheduleRange);
    setComparisonFields(emptyFields);
  }

  const copyText =
    result && input
      ? `CancerTime estimate\n\nTreatment visits: ${formatNumber(input.visitsPerMonth)} per month\nAverage clinic time: ${formatNumber(input.centerHoursPerVisit)} hours per visit\nTravel: ${formatNumber(input.travelHoursPerVisit)} hours round trip\n\n${periodLabel ? `Schedule end: ${formatScheduleRange(scheduleRange!.value, scheduleRange!.unit)}\n\nEstimated time over this schedule:\n${formatNumber(result.totalHours)} hours total` : `Estimated annual time:\n${formatNumber(result.totalHours)} hours/year`}\n\nEquivalent to approximately ${formatNumber(result.eightHourDays)} eight-hour days.\n\n${formatNumber(result.centerHours)} hours at the treatment center\n${formatNumber(result.travelHours)} hours traveling\n\nGenerated using CancerTime.`
      : "";

  const isRanged = Boolean(periodLabel);
  const comparisonUnit = isRanged ? "hours total" : "hours/year";

  return (
    <div>
      <div className="mb-10 max-w-3xl">
        <p className="section-kicker">Treatment time</p>
        <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Treatment Time Calculator
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate">
          Estimate how much time you spend traveling to and receiving cancer treatment.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10">
        <form
          onSubmit={(event) => event.preventDefault()}
          className="rounded-[2rem] border border-line/70 bg-surface p-5 shadow-sm min-[375px]:p-6 sm:p-8"
        >
          <div className="space-y-9">
            <NumberInput
              id="treatment-visits"
              label="How many cancer-treatment visits do you usually have each month?"
              value={fields.visits}
              onChange={(value) => updateField("visits", value)}
              max={INPUT_LIMITS.visitsPerMonth}
              placeholder="3"
              unit="visits / month"
            />
            <NumberInput
              id="treatment-center"
              label="On average, how many hours do you spend at the treatment center during each visit?"
              value={fields.center}
              onChange={(value) => updateField("center", value)}
              max={INPUT_LIMITS.hoursPerVisit}
              placeholder="5"
              unit="hours / visit"
            />
            <NumberInput
              id="treatment-travel"
              label="How long does the total trip to and from your treatment center usually take?"
              value={fields.travel}
              onChange={(value) => updateField("travel", value)}
              max={INPUT_LIMITS.travelHoursPerVisit}
              placeholder="1.5"
              unit="hours round trip"
            />
            <ScheduleRangeInput
              id="treatment-range"
              fields={rangeFields}
              onChange={onRangeFieldsChange}
              combinationError={
                rangeConflict
                  ? "A visit-based end point needs more than 0 visits per month."
                  : null
              }
            />
          </div>
          <button type="button" onClick={reset} className="button-secondary mt-8">
            Reset calculator
          </button>
        </form>

        {result ? (
          <ResultCard
            eyebrow={isRanged ? "Your estimated schedule time" : "Your estimated annual time"}
            periodLabel={periodLabel}
            totalHours={result.totalHours}
            totalLabel={isRanged ? "hours total" : "hours/year"}
            eightHourDays={result.eightHourDays}
            metrics={[
              { label: "Hours / month", value: formatNumber(result.hoursPerMonth) },
              { label: isRanged ? "Visits total" : "Visits / year", value: formatNumber(result.visits) },
              { label: isRanged ? "Clinic hours" : "Clinic hours / year", value: formatNumber(result.centerHours) },
              { label: isRanged ? "Travel hours" : "Travel hours / year", value: formatNumber(result.travelHours) },
            ]}
            breakdown={[
              { label: "Treatment center time", value: result.centerHours },
              { label: "Travel time", value: result.travelHours, color: "navy" },
            ]}
            breakdownHeading={isRanged ? "Selected schedule breakdown" : undefined}
            copyText={copyText}
          />
        ) : (
          <ResultPlaceholder calculator="treatment and schedule end" />
        )}
      </div>

      <details className="group mt-12 overflow-hidden rounded-[2rem] border border-line/70 bg-surface shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-6 font-bold text-ink outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-teal/20 sm:px-8">
          <span>
            <span className="block text-xl">Compare another schedule</span>
            <span className="mt-1 block text-sm font-normal text-slate">
              Uses the same selected time range as Schedule A
            </span>
          </span>
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-wash/45 text-2xl transition group-open:rotate-45">+</span>
        </summary>
        <div className="border-t border-line px-6 py-8 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
            <div>
              <h3 className="font-serif text-3xl font-bold text-ink">Schedule B</h3>
              <div className="mt-6 space-y-7">
                <NumberInput
                  id="comparison-visits"
                  label="Treatment visits per month"
                  value={comparisonFields.visits}
                  onChange={(value) => updateComparisonField("visits", value)}
                  max={INPUT_LIMITS.visitsPerMonth}
                  placeholder="2"
                  unit="visits / month"
                />
                <NumberInput
                  id="comparison-center"
                  label="Time at the treatment center per visit"
                  value={comparisonFields.center}
                  onChange={(value) => updateComparisonField("center", value)}
                  max={INPUT_LIMITS.hoursPerVisit}
                  placeholder="6"
                  unit="hours / visit"
                />
                <NumberInput
                  id="comparison-travel"
                  label="Round-trip travel time per visit"
                  value={comparisonFields.travel}
                  onChange={(value) => updateComparisonField("travel", value)}
                  max={INPUT_LIMITS.travelHoursPerVisit}
                  placeholder="2"
                  unit="hours round trip"
                />
              </div>
            </div>

            <div aria-live="polite">
              {result && comparisonResult ? (
                <div className="rounded-3xl bg-wash/45 p-6 sm:p-8">
                  <p className="section-kicker">Difference in estimated time burden</p>
                  {periodLabel ? (
                    <p className="mt-3 text-sm font-semibold text-slate">{periodLabel}</p>
                  ) : null}
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-surface p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate">Schedule A</p>
                      <p className="mt-2 text-2xl font-bold text-ink">{formatNumber(result.totalHours)} <span className="text-sm font-medium">{comparisonUnit}</span></p>
                    </div>
                    <div className="rounded-2xl bg-surface p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate">Schedule B</p>
                      <p className="mt-2 text-2xl font-bold text-ink">{formatNumber(comparisonResult.totalHours)} <span className="text-sm font-medium">{comparisonUnit}</span></p>
                    </div>
                    <div className="rounded-2xl bg-surface p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate">Difference</p>
                      <p className="mt-2 text-lg font-bold leading-7 text-ink">{formatSignedDifference(comparisonResult.totalHours - result.totalHours, comparisonUnit)}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-slate">
                    Equivalent difference: {formatNumber(Math.abs(comparisonResult.eightHourDays - result.eightHourDays))} eight-hour days.
                  </p>
                  <p className="mt-5 border-t border-line pt-5 text-sm leading-6 text-slate">
                    Time burden is only one aspect of cancer treatment. CancerTime does not compare treatment effectiveness, safety, or medical appropriateness.
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-line p-8 text-sm leading-6 text-slate">
                  {comparisonRangeConflict
                    ? "A visit-based end point needs more than 0 visits per month in Schedule B."
                    : "Complete Schedule A and Schedule B to see a neutral comparison of estimated time."}
                </div>
              )}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
