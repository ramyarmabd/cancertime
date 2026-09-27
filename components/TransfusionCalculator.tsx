"use client";

import { useMemo, useState } from "react";
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
  calculateTransfusionTime,
  calculateVisitTimeRange,
} from "@/lib/calculations";
import { formatNumber, formatScheduleRange } from "@/lib/formatting";
import type { SharedVisitFields } from "@/components/CalculatorTabs";

interface TransfusionCalculatorProps {
  fields: SharedVisitFields;
  onFieldsChange: (fields: SharedVisitFields) => void;
  rangeFields: ScheduleRangeFields;
  onRangeFieldsChange: (fields: ScheduleRangeFields) => void;
}

export function TransfusionCalculator({
  fields,
  onFieldsChange,
  rangeFields,
  onRangeFieldsChange,
}: TransfusionCalculatorProps) {
  const { visits, center, travel } = fields;
  const [accompanied, setAccompanied] = useState(false);

  const input = useMemo(() => {
    if (
      visits === "" ||
      center === "" ||
      travel === "" ||
      getNumberError(visits, INPUT_LIMITS.visitsPerMonth) ||
      getNumberError(center, INPUT_LIMITS.hoursPerVisit) ||
      getNumberError(travel, INPUT_LIMITS.travelHoursPerVisit)
    ) {
      return null;
    }

    return {
      visitsPerMonth: Number(visits),
      centerHoursPerVisit: Number(center),
      travelHoursPerVisit: Number(travel),
    };
  }, [visits, center, travel]);
  const scheduleRange = useMemo(
    () => parseScheduleRange(rangeFields),
    [rangeFields],
  );
  const rangeConflict = Boolean(
    input &&
      rangeFields.enabled &&
      rangeFields.unit === "visits" &&
      Number(rangeFields.value) > 0 &&
      input.visitsPerMonth === 0,
  );

  const result = useMemo(() => {
    if (!input || rangeConflict) return null;

    if (rangeFields.enabled) {
      if (!scheduleRange) return null;
      const ranged = calculateVisitTimeRange(input, scheduleRange);
      return {
        totalHours: ranged.totalHours,
        hoursPerMonth: ranged.hoursPerMonth,
        visits: ranged.visitsInRange,
        centerHours: ranged.centerHoursInRange,
        travelHours: ranged.travelHoursInRange,
        eightHourDays: ranged.eightHourDays,
      };
    }

    const annual = calculateTransfusionTime(input);
    return {
      totalHours: annual.totalHoursPerYear,
      hoursPerMonth: annual.hoursPerMonth,
      visits: annual.visitsPerYear,
      centerHours: annual.centerHoursPerYear,
      travelHours: annual.travelHoursPerYear,
      eightHourDays: annual.eightHourDays,
    };
  }, [input, rangeConflict, rangeFields.enabled, scheduleRange]);

  const periodLabel =
    rangeFields.enabled && scheduleRange
      ? `Ends after ${formatScheduleRange(scheduleRange.value, scheduleRange.unit)}`
      : undefined;
  const isRanged = Boolean(periodLabel);

  function reset() {
    onFieldsChange({ visits: "", center: "", travel: "" });
    setAccompanied(false);
    onRangeFieldsChange(emptyScheduleRange);
  }

  const copyText =
    result && input
      ? `CancerTime estimate\n\nTransfusion visits: ${formatNumber(input.visitsPerMonth)} per month\nAverage center time: ${formatNumber(input.centerHoursPerVisit)} hours per visit\nTravel: ${formatNumber(input.travelHoursPerVisit)} hours round trip\n\n${periodLabel ? `Schedule end: ${formatScheduleRange(scheduleRange!.value, scheduleRange!.unit)}\n\nEstimated time over this schedule:\n${formatNumber(result.totalHours)} hours total` : `Estimated annual time:\n${formatNumber(result.totalHours)} hours/year`}\n\nEquivalent to approximately ${formatNumber(result.eightHourDays)} eight-hour days.\n\n${formatNumber(result.centerHours)} hours at the transfusion center\n${formatNumber(result.travelHours)} hours traveling${accompanied ? `\n${formatNumber(result.totalHours)} accompanying caregiver-hours${isRanged ? " total" : "/year"}\n${formatNumber(result.totalHours * 2)} combined person-hours${isRanged ? " total" : "/year"}` : ""}\n\nGenerated using CancerTime.`
      : "";

  return (
    <div>
      <div className="mb-10 max-w-3xl">
        <p className="section-kicker">Transfusion time</p>
        <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Transfusion Time Calculator
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate">
          Estimate the time associated with transfusion visits.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10">
        <form
          onSubmit={(event) => event.preventDefault()}
          className="rounded-[2rem] border border-line/70 bg-surface p-5 shadow-sm min-[375px]:p-6 sm:p-8"
        >
          <div className="space-y-9">
            <NumberInput id="transfusion-visits" label="How many transfusion visits do you usually have each month?" value={visits} onChange={(value) => onFieldsChange({ ...fields, visits: value })} max={INPUT_LIMITS.visitsPerMonth} placeholder="2" unit="visits / month" />
            <NumberInput id="transfusion-center" label="On average, how many hours do you spend at the transfusion center during each visit?" value={center} onChange={(value) => onFieldsChange({ ...fields, center: value })} max={INPUT_LIMITS.hoursPerVisit} placeholder="6" unit="hours / visit" />
            <NumberInput id="transfusion-travel" label="How long does the total trip to and from the transfusion center usually take?" value={travel} onChange={(value) => onFieldsChange({ ...fields, travel: value })} max={INPUT_LIMITS.travelHoursPerVisit} placeholder="1.5" unit="hours round trip" />
            <label className="flex cursor-pointer items-start gap-3 rounded-3xl border border-line/80 bg-wash/25 p-5">
              <input type="checkbox" checked={accompanied} onChange={(event) => setAccompanied(event.target.checked)} className="mt-0.5 size-5 accent-teal" />
              <span>
                <span className="block font-bold text-ink">Someone usually accompanies me to transfusion visits</span>
                <span className="mt-1 block text-sm leading-6 text-slate">Adds an estimate of time spent by an accompanying caregiver.</span>
              </span>
            </label>
            <ScheduleRangeInput
              id="transfusion-range"
              fields={rangeFields}
              onChange={onRangeFieldsChange}
              combinationError={
                rangeConflict
                  ? "A visit-based end point needs more than 0 visits per month."
                  : null
              }
            />
          </div>
          <button type="button" onClick={reset} className="button-secondary mt-8">Reset calculator</button>
        </form>

        {result ? (
          <ResultCard
            eyebrow={isRanged ? "Your estimated schedule time" : "Your estimated annual transfusion time"}
            periodLabel={periodLabel}
            totalHours={result.totalHours}
            totalLabel={isRanged ? "hours total" : "hours/year"}
            eightHourDays={result.eightHourDays}
            metrics={[
              { label: "Hours / month", value: formatNumber(result.hoursPerMonth) },
              { label: isRanged ? "Visits total" : "Visits / year", value: formatNumber(result.visits) },
              { label: isRanged ? "Center hours" : "Center hours / year", value: formatNumber(result.centerHours) },
              { label: isRanged ? "Travel hours" : "Travel hours / year", value: formatNumber(result.travelHours) },
            ]}
            breakdown={[
              { label: "Transfusion center time", value: result.centerHours },
              { label: "Travel time", value: result.travelHours, color: "navy" },
            ]}
            breakdownHeading={isRanged ? "Selected schedule breakdown" : undefined}
            copyText={copyText}
          >
            {accompanied ? (
              <div className="mt-7 rounded-3xl bg-gold/25 p-5 sm:p-6">
                <p className="text-sm font-bold text-ink">Estimated accompanying caregiver time</p>
                <p className="mt-1 text-2xl font-bold text-ink">{formatNumber(result.totalHours)} caregiver-hours{isRanged ? " total" : "/year"}</p>
                <p className="mt-5 text-sm font-bold text-ink">Combined patient + caregiver time</p>
                <p className="mt-1 text-xl font-bold text-ink">{formatNumber(result.totalHours * 2)} person-hours{isRanged ? " total" : "/year"}</p>
                <p className="mt-2 text-xs leading-5 text-slate">Person-hours combine the time of each person. They do not mean the patient personally spends this combined amount of time.</p>
              </div>
            ) : null}
          </ResultCard>
        ) : (
          <ResultPlaceholder calculator="transfusion and schedule end" />
        )}
      </div>
    </div>
  );
}
