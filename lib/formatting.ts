export function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatSignedDifference(value: number, unit = "hours/year") {
  const absoluteValue = formatNumber(Math.abs(value));

  if (value === 0) {
    return unit === "hours/year"
      ? "No difference in estimated annual hours"
      : "No difference in estimated total hours";
  }

  return `${absoluteValue} ${value < 0 ? "fewer" : "more"} ${unit}`;
}

const singularRangeUnits = {
  visits: "visit",
  weeks: "week",
  months: "month",
  years: "year",
} as const;

export function formatScheduleRange(
  value: number,
  unit: keyof typeof singularRangeUnits,
) {
  const label = value === 1 ? singularRangeUnits[unit] : unit;
  return `${formatNumber(value)} ${label}`;
}
