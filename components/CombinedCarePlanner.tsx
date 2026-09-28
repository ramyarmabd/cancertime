"use client";

import { useMemo, useRef, useState } from "react";
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
import { calculateCombinedCarePlan } from "@/lib/calculations";
import {
  emptyVisitForm,
  visitFormToInput,
  type VisitFormFields,
} from "@/lib/form-values";
import { formatNumber, formatScheduleRange } from "@/lib/formatting";

const activityLabels = [
  "Treatment",
  "Lab work",
  "Scan or imaging",
  "Transfusion",
  "Other visit",
] as const;

interface CareActivityFields {
  id: string;
  label: (typeof activityLabels)[number];
  fields: VisitFormFields;
  sharesTravel: boolean;
}

function cloneVisitForm(fields: VisitFormFields): VisitFormFields {
  return {
    frequency: { ...fields.frequency },
    center: { ...fields.center },
    travel: { ...fields.travel },
  };
}

function emptyActivity(id: string, label: CareActivityFields["label"] = "Treatment"): CareActivityFields {
  return {
    id,
    label,
    fields: cloneVisitForm(emptyVisitForm),
    sharesTravel: false,
  };
}

interface CombinedCarePlannerProps {
  treatmentFields: VisitFormFields;
  treatmentRange: ScheduleRangeFields;
  canImportTreatment: boolean;
}

export function CombinedCarePlanner({
  treatmentFields,
  treatmentRange,
  canImportTreatment,
}: CombinedCarePlannerProps) {
  const nextId = useRef(2);
  const [activities, setActivities] = useState<CareActivityFields[]>([
    emptyActivity("activity-1"),
  ]);
  const [rangeFields, setRangeFields] = useState<ScheduleRangeFields>(emptyScheduleRange);
  const scheduleRange = useMemo(() => parseScheduleRange(rangeFields), [rangeFields]);
  const parsedActivities = useMemo(
    () =>
      activities.map((activity) => {
        const input = visitFormToInput(
          activity.sharesTravel
            ? {
                ...activity.fields,
                travel: { hours: "0", minutes: "0" },
              }
            : activity.fields,
        );
        return input
          ? {
              ...input,
              label: activity.label,
              sharesTravel: activity.sharesTravel,
            }
          : null;
      }),
    [activities],
  );
  const result = useMemo(() => {
    if (!scheduleRange || parsedActivities.some((activity) => !activity)) return null;
    return calculateCombinedCarePlan(
      parsedActivities.filter((activity) => activity !== null),
      scheduleRange,
    );
  }, [parsedActivities, scheduleRange]);
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

  function updateActivity(id: string, update: Partial<CareActivityFields>) {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id ? { ...activity, ...update } : activity,
      ),
    );
  }

  function addActivity() {
    const id = `activity-${nextId.current}`;
    const label = activityLabels[Math.min(activities.length, activityLabels.length - 1)];
    nextId.current += 1;
    setActivities((current) => [...current, emptyActivity(id, label)]);
  }

  function importTreatment() {
    setActivities([
      {
        id: "activity-1",
        label: "Treatment",
        fields: cloneVisitForm(treatmentFields),
        sharesTravel: false,
      },
    ]);
    setRangeFields(
      treatmentRange.mode === "course" && treatmentRange.unit === "visits"
        ? { ...emptyScheduleRange }
        : { ...treatmentRange },
    );
  }

  function reset() {
    nextId.current = 2;
    setActivities([emptyActivity("activity-1")]);
    setRangeFields(emptyScheduleRange);
  }

  const copyText = result
    ? `CancerTime combined care estimate\n\nEstimate period: ${selectedPeriod}\nActivities included:\n${result.activities
        .map(
          (activity) =>
            `- ${activity.label}: ${formatNumber(activity.visits)} occurrences, ${formatNumber(activity.totalHours)} hours${activity.sharesTravel ? " (travel grouped with the previous activity)" : ""}`,
        )
        .join("\n")}\n\nEstimated time: ${formatNumber(result.totalHours)} ${selectedTotalLabel}\nApproximately ${formatNumber(result.eightHourDays)} eight-hour days\n\n${formatNumber(result.centerHours)} hours at care locations\n${formatNumber(result.travelHours)} travel hours\n\nGenerated using CancerTime.`
    : "";

  return (
    <div>
      <div className="mb-5 max-w-3xl">
        <p className="section-kicker">Combined care planner</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          See multiple types of care together
        </h2>
        <p className="mt-2 text-base leading-7 text-slate">
          Add treatment, labs, scans, transfusions, or other visits. Group activities that always happen on the same trip so travel is counted once.
        </p>
      </div>

      {canImportTreatment ? (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-wash/25 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="leading-6 text-slate">Start the plan with the treatment schedule you already entered.</p>
          <button type="button" onClick={importTreatment} className="button-secondary shrink-0">Use my treatment inputs</button>
        </div>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] xl:gap-8">
        <form onSubmit={(event) => event.preventDefault()} className="space-y-5">
          {activities.map((activity, index) => (
            <fieldset key={activity.id} className="rounded-[2rem] border border-line/70 bg-surface p-5 shadow-sm sm:p-6">
              <legend className="sr-only">Care activity {index + 1}</legend>
              <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">Activity {index + 1}</p>
                  <select
                    aria-label={`Activity ${index + 1} type`}
                    value={activity.label}
                    onChange={(event) => updateActivity(activity.id, { label: event.target.value as CareActivityFields["label"] })}
                    className="mt-2 h-12 rounded-xl border border-line bg-surface px-3 text-base font-bold text-ink outline-none focus:border-teal focus:ring-4 focus:ring-teal/15"
                  >
                    {activityLabels.map((label) => <option key={label}>{label}</option>)}
                  </select>
                </div>
                {activities.length > 1 ? (
                  <button type="button" onClick={() => setActivities((current) => current.filter((item) => item.id !== activity.id))} className="button-secondary self-start" aria-label={`Remove ${activity.label}`}>Remove</button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <FrequencyInput
                  id={`${activity.id}-frequency`}
                  label="Visit frequency"
                  helpText={`How often ${activity.label.toLowerCase()} occurs.`}
                  fields={activity.fields.frequency}
                  onChange={(frequency) => updateActivity(activity.id, { fields: { ...activity.fields, frequency } })}
                />
                <DurationInput
                  id={`${activity.id}-center`}
                  label="Time at the care location"
                  helpText="Time for this activity, including waiting."
                  fields={activity.fields.center}
                  onChange={(center) => updateActivity(activity.id, { fields: { ...activity.fields, center } })}
                />
              </div>

              {index > 0 ? (
                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-wash/25 p-4">
                  <input
                    type="checkbox"
                    checked={activity.sharesTravel}
                    onChange={(event) => updateActivity(activity.id, { sharesTravel: event.target.checked })}
                    className="mt-0.5 size-5 accent-teal"
                  />
                  <span>
                    <span className="block font-bold text-ink">Same trip as the activity above</span>
                    <span className="mt-1 block text-sm leading-6 text-slate">Use this only when these activities usually happen together. Travel for this row will not be counted again.</span>
                  </span>
                </label>
              ) : null}

              {!activity.sharesTravel ? (
                <div className="mt-6">
                  <DurationInput
                    id={`${activity.id}-travel`}
                    label="Round-trip travel"
                    helpText="Travel for this activity or grouped trip."
                    fields={activity.fields.travel}
                    onChange={(travel) => updateActivity(activity.id, { fields: { ...activity.fields, travel } })}
                  />
                </div>
              ) : null}
            </fieldset>
          ))}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={addActivity} className="button-primary">Add another activity <span aria-hidden="true">+</span></button>
            <button type="button" onClick={reset} className="button-secondary">Reset planner</button>
          </div>

          <div className="rounded-[2rem] border border-line/70 bg-surface p-5 shadow-sm sm:p-6">
            <ScheduleRangeInput
              id="planner-range"
              fields={rangeFields}
              onChange={setRangeFields}
              allowVisits={false}
            />
          </div>
        </form>

        <div className="xl:sticky xl:top-24">
          {result ? (
            <ResultCard
              eyebrow="Your combined care estimate"
              periodLabel={selectedPeriod}
              totalHours={result.totalHours}
              totalLabel={selectedTotalLabel}
              eightHourDays={result.eightHourDays}
              metrics={[
                { label: "Monthly average", value: `${formatNumber(result.hoursPerMonth)} hr` },
                { label: "Care activities", value: formatNumber(result.activityOccurrences) },
                { label: "Care-location time", value: `${formatNumber(result.centerHours)} hr` },
                { label: "Travel time", value: `${formatNumber(result.travelHours)} hr` },
              ]}
              breakdown={[
                { label: "Care locations", value: result.centerHours },
                { label: "Travel", value: result.travelHours, color: "navy" },
              ]}
              breakdownHeading="Where the time goes"
              copyText={copyText}
            >
              <div className="mt-7 border-t border-line pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate">Activity totals</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {result.activities.map((activity, index) => (
                    <li key={`${activity.label}-${index}`} className="flex justify-between gap-4 rounded-xl bg-canvas px-3 py-2">
                      <span className="text-ink">{activity.label}{activity.sharesTravel ? " · shared trip" : ""}</span>
                      <strong className="shrink-0 text-ink">{formatNumber(activity.totalHours)} hr</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </ResultCard>
          ) : (
            <ResultPlaceholder prompt="Complete each activity’s frequency, care-location time, and travel time to see the combined estimate." />
          )}
        </div>
      </div>
    </div>
  );
}
