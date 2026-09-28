import { formatNumber } from "@/lib/formatting";

interface BreakdownItem {
  label: string;
  value: number;
  color?: "teal" | "navy";
}

export function TimeBreakdown({
  items,
  heading = "Annual time breakdown",
  ariaPeriod = "per year",
}: {
  items: BreakdownItem[];
  heading?: string;
  ariaPeriod?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className="border-t border-line pt-6"
      role="img"
      aria-label={items
        .map((item) => `${item.label}: ${formatNumber(item.value)} hours ${ariaPeriod}`)
        .join(". ")}
    >
      <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-slate">
        {heading}
      </p>
      <div className="flex h-4 overflow-hidden rounded-full bg-wash" aria-hidden="true">
        {items.map((item) => {
          const width = total === 0 ? 0 : (item.value / total) * 100;
          return (
            <div
              key={item.label}
              className={item.color === "navy" ? "h-full bg-navy" : "h-full bg-teal"}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const percentage = total === 0 ? 0 : (item.value / total) * 100;
          return (
            <div key={item.label} className="flex items-start justify-between gap-4 rounded-2xl bg-canvas px-4 py-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-semibold text-ink">
                <span
                  aria-hidden="true"
                  className={`size-2.5 shrink-0 rounded-full ${item.color === "navy" ? "bg-navy" : "bg-teal"}`}
                />
                {item.label}
              </span>
              <span className="shrink-0 text-right text-slate">
                <strong className="font-semibold text-ink">{formatNumber(percentage)}%</strong>
                <span className="block">{formatNumber(item.value)} hr</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
