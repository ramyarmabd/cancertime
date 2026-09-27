"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { CaregiverCalculator } from "@/components/CaregiverCalculator";
import {
  emptyScheduleRange,
  type ScheduleRangeFields,
} from "@/components/ScheduleRangeInput";
import { TransfusionCalculator } from "@/components/TransfusionCalculator";
import { TreatmentCalculator } from "@/components/TreatmentCalculator";

const calculators = [
  { id: "treatment", label: "Treatment Time" },
  { id: "transfusion", label: "Transfusion Time" },
  { id: "caregiver", label: "Caregiver Time" },
] as const;

type CalculatorId = (typeof calculators)[number]["id"];

export interface SharedVisitFields {
  visits: string;
  center: string;
  travel: string;
}

const emptySharedVisitFields: SharedVisitFields = {
  visits: "",
  center: "",
  travel: "",
};

function isCalculatorId(value: string): value is CalculatorId {
  return calculators.some((calculator) => calculator.id === value);
}

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashSnapshot(): CalculatorId {
  const value = window.location.hash.replace("#", "");
  return isCalculatorId(value) ? value : "treatment";
}

function getServerSnapshot(): CalculatorId {
  return "treatment";
}

export function CalculatorTabs() {
  const selected = useSyncExternalStore(
    subscribeToHash,
    getHashSnapshot,
    getServerSnapshot,
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [sharedVisitFields, setSharedVisitFields] =
    useState<SharedVisitFields>(emptySharedVisitFields);
  const [sharedRangeFields, setSharedRangeFields] =
    useState<ScheduleRangeFields>(emptyScheduleRange);

  function selectTab(id: CalculatorId) {
    window.history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % calculators.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + calculators.length) % calculators.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = calculators.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      const next = calculators[nextIndex];
      selectTab(next.id);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <div>
      <div className="bg-canvas py-5 sm:py-6">
        <div
          className="container-shell grid grid-cols-3 gap-1 rounded-[1.6rem] border border-line/70 bg-surface p-1.5 shadow-sm"
          role="tablist"
          aria-label="Cancer care time calculators"
        >
          {calculators.map((calculator, index) => (
            <button
              key={calculator.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              type="button"
              role="tab"
              id={`tab-${calculator.id}`}
              aria-selected={selected === calculator.id}
              aria-controls={`panel-${calculator.id}`}
              tabIndex={selected === calculator.id ? 0 : -1}
              onClick={() => selectTab(calculator.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="relative min-h-14 rounded-[1.2rem] px-1 py-3 text-xs font-bold leading-4 text-slate outline-none transition hover:bg-wash/35 hover:text-ink focus-visible:z-10 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-teal/20 aria-selected:bg-action aria-selected:text-white min-[375px]:px-2 min-[375px]:text-sm min-[375px]:leading-5 sm:min-h-16 sm:px-5 sm:text-base"
            >
              {calculator.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-shell pb-16 pt-8 sm:pb-20 sm:pt-10 lg:pb-24">
        <div className="mb-8 rounded-3xl border border-line/70 bg-wash/30 px-5 py-4 text-sm leading-6 text-slate sm:px-6">
          <p className="font-bold text-ink">Matching entries carry over automatically.</p>
          <p className="mt-1">When you switch calculators, equivalent visit, time, travel, and schedule-end fields stay filled. Calculator-specific fields remain separate.</p>
        </div>
        {calculators.map((calculator) => (
          <div
            key={calculator.id}
            role="tabpanel"
            id={`panel-${calculator.id}`}
            aria-labelledby={`tab-${calculator.id}`}
            tabIndex={0}
            hidden={selected !== calculator.id}
            className="outline-none focus-visible:ring-3 focus-visible:ring-teal/20"
          >
            {calculator.id === "treatment" ? (
              <TreatmentCalculator
                fields={sharedVisitFields}
                onFieldsChange={setSharedVisitFields}
                rangeFields={sharedRangeFields}
                onRangeFieldsChange={setSharedRangeFields}
              />
            ) : null}
            {calculator.id === "transfusion" ? (
              <TransfusionCalculator
                fields={sharedVisitFields}
                onFieldsChange={setSharedVisitFields}
                rangeFields={sharedRangeFields}
                onRangeFieldsChange={setSharedRangeFields}
              />
            ) : null}
            {calculator.id === "caregiver" ? (
              <CaregiverCalculator
                visits={sharedVisitFields.visits}
                onVisitsChange={(visits) =>
                  setSharedVisitFields((current) => ({ ...current, visits }))
                }
                rangeFields={sharedRangeFields}
                onRangeFieldsChange={setSharedRangeFields}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
