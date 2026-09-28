"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { CaregiverCalculator } from "@/components/CaregiverCalculator";
import { CombinedCarePlanner } from "@/components/CombinedCarePlanner";
import {
  emptyScheduleRange,
  type ScheduleRangeFields,
} from "@/components/ScheduleRangeInput";
import { TransfusionCalculator } from "@/components/TransfusionCalculator";
import { TreatmentCalculator } from "@/components/TreatmentCalculator";
import {
  emptyCaregiverForm,
  emptyVisitForm,
  hasAnyVisitFormValue,
  hoursToDurationFields,
  visitFormToInput,
  type CaregiverFormFields,
  type VisitFormFields,
} from "@/lib/form-values";

const calculators = [
  { id: "treatment", label: "Treatment" },
  { id: "transfusion", label: "Transfusion" },
  { id: "caregiver", label: "Caregiver" },
  { id: "planner", label: "Care planner" },
] as const;

type CalculatorId = (typeof calculators)[number]["id"];

function cloneVisitForm(fields: VisitFormFields): VisitFormFields {
  return {
    frequency: { ...fields.frequency },
    center: { ...fields.center },
    travel: { ...fields.travel },
  };
}

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

function ImportNotice({ onImport, label }: { onImport: () => void; label: string }) {
  return (
    <aside className="mb-4 flex flex-col gap-3 rounded-2xl border border-line/70 bg-wash/25 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="leading-6 text-slate">
        Reuse your treatment schedule only if it applies here.
      </p>
      <button type="button" onClick={onImport} className="button-secondary shrink-0">
        {label}
      </button>
    </aside>
  );
}

function ImportedNotice({ onReviewed }: { onReviewed: () => void }) {
  return (
    <aside className="mb-4 flex flex-col gap-3 rounded-2xl border border-gold bg-gold/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="leading-6 text-ink">
        <strong>Imported from treatment.</strong> Review these values because this schedule may be different.
      </p>
      <button type="button" onClick={onReviewed} className="button-secondary shrink-0">
        I reviewed them
      </button>
    </aside>
  );
}

export function CalculatorTabs() {
  const selected = useSyncExternalStore(
    subscribeToHash,
    getHashSnapshot,
    getServerSnapshot,
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [treatmentFields, setTreatmentFields] = useState<VisitFormFields>(emptyVisitForm);
  const [treatmentRange, setTreatmentRange] = useState<ScheduleRangeFields>(emptyScheduleRange);
  const [transfusionFields, setTransfusionFields] = useState<VisitFormFields>(emptyVisitForm);
  const [transfusionRange, setTransfusionRange] = useState<ScheduleRangeFields>(emptyScheduleRange);
  const [caregiverFields, setCaregiverFields] = useState<CaregiverFormFields>(emptyCaregiverForm);
  const [caregiverRange, setCaregiverRange] = useState<ScheduleRangeFields>(emptyScheduleRange);
  const [transfusionImported, setTransfusionImported] = useState(false);
  const [caregiverImported, setCaregiverImported] = useState(false);

  const treatmentInput = visitFormToInput(treatmentFields);
  const canReuseTreatment = hasAnyVisitFormValue(treatmentFields);

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

  function importTreatmentToTransfusion() {
    setTransfusionFields(cloneVisitForm(treatmentFields));
    setTransfusionRange({ ...treatmentRange });
    setTransfusionImported(true);
  }

  function importTreatmentToCaregiver() {
    setCaregiverFields({
      frequency: { ...treatmentFields.frequency },
      visit: treatmentInput
        ? hoursToDurationFields(
            treatmentInput.centerHoursPerVisit + treatmentInput.travelHoursPerVisit,
          )
        : { hours: "", minutes: "" },
      additional: { hours: "", minutes: "" },
    });
    setCaregiverRange({ ...treatmentRange });
    setCaregiverImported(true);
  }

  return (
    <div>
      <div className="bg-canvas py-3 sm:py-4">
        <div
          className="container-shell grid grid-cols-2 gap-1 rounded-[1.4rem] border border-line/70 bg-surface p-1.5 shadow-sm sm:grid-cols-4"
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
              className="relative min-h-12 rounded-[1rem] px-2 py-2 text-sm font-bold leading-5 text-slate outline-none transition hover:bg-wash/35 hover:text-ink focus-visible:z-10 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-teal/20 aria-selected:bg-action aria-selected:text-white sm:min-h-14 sm:px-4 sm:text-base"
            >
              {calculator.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-shell pb-16 pt-4 sm:pb-20 sm:pt-6 lg:pb-24">
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
                fields={treatmentFields}
                onFieldsChange={setTreatmentFields}
                rangeFields={treatmentRange}
                onRangeFieldsChange={setTreatmentRange}
              />
            ) : null}
            {calculator.id === "transfusion" ? (
              <>
                {transfusionImported ? (
                  <ImportedNotice onReviewed={() => setTransfusionImported(false)} />
                ) : canReuseTreatment ? (
                  <ImportNotice onImport={importTreatmentToTransfusion} label="Use my treatment inputs" />
                ) : null}
                <TransfusionCalculator
                  fields={transfusionFields}
                  onFieldsChange={setTransfusionFields}
                  rangeFields={transfusionRange}
                  onRangeFieldsChange={setTransfusionRange}
                />
              </>
            ) : null}
            {calculator.id === "caregiver" ? (
              <>
                {caregiverImported ? (
                  <ImportedNotice onReviewed={() => setCaregiverImported(false)} />
                ) : canReuseTreatment ? (
                  <ImportNotice onImport={importTreatmentToCaregiver} label="Use my treatment schedule" />
                ) : null}
                <CaregiverCalculator
                  fields={caregiverFields}
                  onFieldsChange={setCaregiverFields}
                  rangeFields={caregiverRange}
                  onRangeFieldsChange={setCaregiverRange}
                />
              </>
            ) : null}
            {calculator.id === "planner" ? (
              <CombinedCarePlanner
                treatmentFields={treatmentFields}
                treatmentRange={treatmentRange}
                canImportTreatment={Boolean(treatmentInput)}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
