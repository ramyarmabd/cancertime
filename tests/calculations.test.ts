import { describe, expect, it } from "vitest";
import {
  calculateCaregiverTime,
  calculateCaregiverTimeRange,
  calculateCombinedCarePlan,
  calculateTransfusionTime,
  calculateTreatmentTime,
  calculateVisitTimeRange,
  frequencyToVisitsPerMonth,
} from "../lib/calculations";

describe("calculateTreatmentTime", () => {
  it("calculates the documented treatment example", () => {
    expect(
      calculateTreatmentTime({
        visitsPerMonth: 3,
        centerHoursPerVisit: 5,
        travelHoursPerVisit: 1.5,
      }),
    ).toEqual({
      visitsPerYear: 36,
      centerHoursPerYear: 180,
      travelHoursPerYear: 54,
      totalHoursPerYear: 234,
      hoursPerMonth: 19.5,
      eightHourDays: 29.25,
    });
  });

  it("accepts zero values", () => {
    expect(
      calculateTreatmentTime({
        visitsPerMonth: 0,
        centerHoursPerVisit: 0,
        travelHoursPerVisit: 0,
      }).totalHoursPerYear,
    ).toBe(0);
  });

  it("preserves decimal precision in the calculation", () => {
    expect(
      calculateTreatmentTime({
        visitsPerMonth: 2.5,
        centerHoursPerVisit: 4.25,
        travelHoursPerVisit: 0.75,
      }).totalHoursPerYear,
    ).toBe(150);
  });

  it("rejects negative and excessive inputs", () => {
    expect(() =>
      calculateTreatmentTime({
        visitsPerMonth: -1,
        centerHoursPerVisit: 2,
        travelHoursPerVisit: 1,
      }),
    ).toThrow(RangeError);

    expect(() =>
      calculateTreatmentTime({
        visitsPerMonth: 101,
        centerHoursPerVisit: 2,
        travelHoursPerVisit: 1,
      }),
    ).toThrow(RangeError);
  });
});

describe("calculateVisitTimeRange", () => {
  const treatmentInput = {
    visitsPerMonth: 3,
    centerHoursPerVisit: 5,
    travelHoursPerVisit: 1.5,
  };

  it("calculates a schedule that ends after six months", () => {
    expect(
      calculateVisitTimeRange(treatmentInput, { value: 6, unit: "months" }),
    ).toEqual({
      visitsInRange: 18,
      centerHoursInRange: 90,
      travelHoursInRange: 27,
      totalHours: 117,
      hoursPerMonth: 19.5,
      eightHourDays: 14.625,
      durationMonths: 6,
    });
  });

  it("calculates a schedule that ends after a set number of visits", () => {
    const result = calculateVisitTimeRange(treatmentInput, {
      value: 10,
      unit: "visits",
    });

    expect(result.totalHours).toBe(65);
    expect(result.visitsInRange).toBe(10);
    expect(result.durationMonths).toBeCloseTo(10 / 3);
  });

  it("rejects a positive visit range when monthly visits are zero", () => {
    expect(() =>
      calculateVisitTimeRange(
        { ...treatmentInput, visitsPerMonth: 0 },
        { value: 4, unit: "visits" },
      ),
    ).toThrow("requires more than zero visits per month");
  });
});

describe("frequencyToVisitsPerMonth", () => {
  it("converts common visit schedules to monthly averages", () => {
    expect(frequencyToVisitsPerMonth({ value: 1, unit: "week" })).toBeCloseTo(52 / 12);
    expect(frequencyToVisitsPerMonth({ value: 1, unit: "two-weeks" })).toBeCloseTo(26 / 12);
    expect(frequencyToVisitsPerMonth({ value: 1, unit: "three-weeks" })).toBeCloseTo(52 / 36);
    expect(frequencyToVisitsPerMonth({ value: 4, unit: "month" })).toBe(4);
  });

  it("rejects a frequency that exceeds the monthly safety limit", () => {
    expect(() =>
      frequencyToVisitsPerMonth({ value: 100, unit: "week" }),
    ).toThrow("Average visits per month");
  });
});

describe("calculateTransfusionTime", () => {
  it("calculates the documented transfusion example", () => {
    expect(
      calculateTransfusionTime({
        visitsPerMonth: 2,
        centerHoursPerVisit: 6,
        travelHoursPerVisit: 1.5,
      }),
    ).toEqual({
      visitsPerYear: 24,
      centerHoursPerYear: 144,
      travelHoursPerYear: 36,
      totalHoursPerYear: 180,
      hoursPerMonth: 15,
      eightHourDays: 22.5,
    });
  });
});

describe("calculateCaregiverTime", () => {
  it("calculates the documented caregiver example", () => {
    expect(
      calculateCaregiverTime({
        visitsPerMonth: 2,
        hoursPerVisit: 6,
        additionalHoursPerWeek: 3,
      }),
    ).toEqual({
      visitHoursPerYear: 144,
      additionalHoursPerYear: 156,
      totalHoursPerYear: 300,
      hoursPerMonth: 25,
      eightHourDays: 37.5,
    });
  });

  it("rejects non-finite and out-of-range inputs", () => {
    expect(() =>
      calculateCaregiverTime({
        visitsPerMonth: Number.NaN,
        hoursPerVisit: 1,
        additionalHoursPerWeek: 1,
      }),
    ).toThrow(TypeError);

    expect(() =>
      calculateCaregiverTime({
        visitsPerMonth: 1,
        hoursPerVisit: 1,
        additionalHoursPerWeek: 169,
      }),
    ).toThrow(RangeError);
  });
});

describe("calculateCaregiverTimeRange", () => {
  const caregiverInput = {
    visitsPerMonth: 2,
    hoursPerVisit: 6,
    additionalHoursPerWeek: 3,
  };

  it("calculates visit and additional support over six months", () => {
    expect(
      calculateCaregiverTimeRange(caregiverInput, {
        value: 6,
        unit: "months",
      }),
    ).toEqual({
      visitsInRange: 12,
      visitHoursInRange: 72,
      additionalHoursInRange: 78,
      totalHours: 150,
      hoursPerMonth: 25,
      eightHourDays: 18.75,
      durationMonths: 6,
    });
  });

  it("derives elapsed time when the schedule ends after visits", () => {
    const result = calculateCaregiverTimeRange(caregiverInput, {
      value: 12,
      unit: "visits",
    });

    expect(result.durationMonths).toBe(6);
    expect(result.totalHours).toBe(150);
  });
});

describe("calculateCombinedCarePlan", () => {
  it("adds activities and does not double-count travel for a shared trip", () => {
    const result = calculateCombinedCarePlan(
      [
        {
          label: "Treatment",
          visitsPerMonth: 2,
          centerHoursPerVisit: 4,
          travelHoursPerVisit: 1,
          sharesTravel: false,
        },
        {
          label: "Lab work",
          visitsPerMonth: 2,
          centerHoursPerVisit: 0.5,
          travelHoursPerVisit: 1,
          sharesTravel: true,
        },
      ],
      { value: 1, unit: "months" },
    );

    expect(result.activityOccurrences).toBe(4);
    expect(result.centerHours).toBe(9);
    expect(result.travelHours).toBe(2);
    expect(result.totalHours).toBe(11);
    expect(result.activities[1].travelHours).toBe(0);
  });

  it("requires a time-based range because visit counts are ambiguous across rows", () => {
    expect(() =>
      calculateCombinedCarePlan([], { value: 8, unit: "visits" }),
    ).toThrow("must use weeks, months, or years");
  });
});
