import { describe, expect, it } from "vitest";
import { calculateCalendarPlan, generateScheduleDates } from "../lib/calendar";

describe("generateScheduleDates", () => {
  it("generates an every-two-weeks schedule by appointment count", () => {
    expect(
      generateScheduleDates("2026-10-01", "two-weeks", { mode: "count", count: 3 }),
    ).toEqual(["2026-10-01", "2026-10-15", "2026-10-29"]);
  });

  it("includes repeating appointments through an inclusive end date", () => {
    expect(
      generateScheduleDates("2026-10-01", "week", { mode: "date", endDate: "2026-10-16" }),
    ).toEqual(["2026-10-01", "2026-10-08", "2026-10-15"]);
  });

  it("keeps monthly schedules at the end of shorter months", () => {
    expect(
      generateScheduleDates("2027-01-31", "month", { mode: "count", count: 3 }),
    ).toEqual(["2027-01-31", "2027-02-28", "2027-03-31"]);
  });

  it("rejects an end date before the first appointment", () => {
    expect(() =>
      generateScheduleDates("2026-10-10", "week", { mode: "date", endDate: "2026-10-01" }),
    ).toThrow("on or after");
  });
});

describe("calculateCalendarPlan", () => {
  it("totals exact-date appointments and groups care types", () => {
    const result = calculateCalendarPlan([
      {
        id: "1",
        date: "2026-10-15",
        category: "Imaging or scan",
        title: "CT scan",
        centerHours: 2,
        travelHours: 1,
      },
      {
        id: "2",
        date: "2026-10-01",
        category: "Treatment",
        title: "Infusion",
        centerHours: 4,
        travelHours: 1,
      },
    ]);

    expect(result).toMatchObject({
      appointments: 2,
      centerHours: 6,
      travelHours: 2,
      totalHours: 8,
      eightHourDays: 1,
      firstDate: "2026-10-01",
      lastDate: "2026-10-15",
    });
    expect(result?.categories).toHaveLength(2);
  });

  it("returns no result for an empty calendar", () => {
    expect(calculateCalendarPlan([])).toBeNull();
  });
});
