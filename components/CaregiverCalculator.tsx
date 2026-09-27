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
  calculateCaregiverTime,
  calculateCaregiverTimeRange,
} from "@/lib/calculations";
import { formatNumber, formatScheduleRange } from "@/lib/formatting";

interface CaregiverCalculatorProps {
  visits: string;
  onVisitsChange: (visits: string) => void;
  rangeFields: ScheduleRangeFields;
  onRangeFieldsChange: (fields: ScheduleRangeFields) => void;
}

export function CaregiverCalculator({
  visits,
  onVisitsChange,
  rangeFields,
  onRangeFieldsChange,
}: CaregiverCalculatorProps) {
  const [visitHours, setVisitHours] = useState("");
  const [additionalHours, setAdditionalHours] = useState("");

  const input = useMemo(() => {
    if (
      visits === "" ||
      visitHours === "" ||
      additionalHours === "" ||
      getNumberError(visits, INPUT_LIMITS.visitsPerMonth) ||
      getNumberError(visitHours, INPUT_LIMITS.hoursPerVisit) ||
      getNumberError(additionalHours, INPUT_LIMITS.additionalHoursPerWeek)
    ) {
      return null;
    }

    return {
      visitsPerMonth: Number(visits),
      hoursPerVisit: Number(visitHours),
      additionalHoursPerWeek: Number(additionalHours),
    };
  }, [visits, visitHours, additionalHours]);
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
      const ranged = calculateCaregiverTimeRange(input, scheduleRange);
      return {
        totalHours: ranged.totalHours,
        hoursPerMonth: ranged.hoursPerMonth,
        visits: ranged.visitsInRange,
        visitHours: ranged.visitHoursInRange,
        additionalHours: ranged.additionalHoursInRange,
        eightHourDays: ranged.eightHourDays,
      };
    }

    const annual = calculateCaregiverTime(input);
    return {
      totalHours: annual.totalHoursPerYear,
      hoursPerMonth: annual.hoursPerMonth,
      visits: input.visitsPerMonth * 12,
      visitHours: annual.visitHoursPerYear,
      additionalHours: annual.additionalHoursPerYear,
      eightHourDays: annual.eightHourDays,
    };
  }, [input, rangeConflict, rangeFields.enabled, scheduleRange]);

  const periodLabel =
    rangeFields.enabled && scheduleRange
      ? `Ends after ${formatScheduleRange(scheduleRange.value, scheduleRange.unit)}`
      : undefined;
  const isRanged = Boolean(periodLabel);

  function reset() {
    onVisitsChange("");
    setVisitHours("");
    setAdditionalHours("");
    onRangeFieldsChange(emptyScheduleRange);
  }

  const copyText =
    result && input
      ? `CancerTime estimate\n\nCancer-related visits accompanied: ${formatNumber(input.visitsPerMonth)} per month\nAverage time per accompanied visit: ${formatNumber(input.hoursPerVisit)} hours\nAdditional caregiving: ${formatNumber(input.additionalHoursPerWeek)} hours per week\n\n${periodLabel ? `Schedule end: ${formatScheduleRange(scheduleRange!.value, scheduleRange!.unit)}\n\nEstimated caregiver time over this schedule:\n${formatNumber(result.totalHours)} caregiver-hours total` : `Estimated annual caregiver time:\n${formatNumber(result.totalHours)} caregiver-hours/year`}\n\nEquivalent to approximately ${formatNumber(result.eightHourDays)} eight-hour days.\n\n${formatNumber(result.visitHours)} visit-related hours\n${formatNumber(result.additionalHours)} additional caregiving hours\n\nGenerated using CancerTime.`
      : "";

  return (
    <div>
      <div className="mb-10 max-w-3xl">
        <p className="section-kicker">Caregiver time</p>
        <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Caregiver Time Calculator
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate">
          Estimate how much time a caregiver spends supporting cancer-related care.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10">
        <form
          onSubmit={(event) => event.preventDefault()}
          className="rounded-[2rem] border border-line/70 bg-surface p-5 shadow-sm min-[375px]:p-6 sm:p-8"
        >
          <div className="space-y-9">
            <NumberInput id="caregiver-visits" label="How many cancer-related visits do you accompany each month?" value={visits} onChange={onVisitsChange} max={INPUT_LIMITS.visitsPerMonth} placeholder="2" unit="visits / month" />
            <NumberInput id="caregiver-visit-hours" label="On average, how many hours does each accompanied visit take, including travel?" value={visitHours} onChange={setVisitHours} max={INPUT_LIMITS.hoursPerVisit} placeholder="6" unit="hours / visit" />
            <NumberInput
              id="caregiver-additional"
              label="How many additional hours do you spend on cancer-related caregiving each week?"
              value={additionalHours}
              onChange={setAdditionalHours}
              max={INPUT_LIMITS.additionalHoursPerWeek}
              placeholder="3"
              unit="hours / week"
              helpText="For example: medication pickup, care coordination, additional transportation, or helping at home."
            />
            <ScheduleRangeInput
              id="caregiver-range"
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
            eyebrow={isRanged ? "Estimated caregiver schedule time" : "Estimated annual caregiver time"}
            periodLabel={periodLabel}
            totalHours={result.totalHours}
            totalLabel={isRanged ? "caregiver-hours total" : "caregiver-hours/year"}
            eightHourDays={result.eightHourDays}
            metrics={[
              { label: "Hours / month", value: formatNumber(result.hoursPerMonth) },
              { label: isRanged ? "Visits total" : "Visits / year", value: formatNumber(result.visits) },
              { label: isRanged ? "Visit hours" : "Visit hours / year", value: formatNumber(result.visitHours) },
              { label: isRanged ? "Additional hours" : "Additional hours / year", value: formatNumber(result.additionalHours) },
            ]}
            breakdown={[
              { label: "Visit-related caregiving", value: result.visitHours },
              { label: "Additional caregiving", value: result.additionalHours, color: "navy" },
            ]}
            breakdownHeading={isRanged ? "Selected schedule breakdown" : undefined}
            copyText={copyText}
          />
        ) : (
          <ResultPlaceholder calculator="caregiver and schedule end" />
        )}
      </div>
    </div>
  );
}
