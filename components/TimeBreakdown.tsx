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
      <div className="space-y-5">
        {items.map((item) => {
          const width = total === 0 ? 0 : (item.value / total) * 100;

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
                <span className="font-medium text-ink">{item.label}</span>
                <span className="whitespace-nowrap text-slate">
                  {formatNumber(item.value)} hours
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-wash" aria-hidden="true">
                <div
                  className={item.color === "navy" ? "h-full rounded-full bg-navy" : "h-full rounded-full bg-teal"}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
