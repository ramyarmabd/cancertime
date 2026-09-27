import { CopyButton } from "@/components/CopyButton";
import { TimeBreakdown } from "@/components/TimeBreakdown";
import { formatNumber } from "@/lib/formatting";

interface Metric {
  label: string;
  value: string;
}

interface BreakdownItem {
  label: string;
  value: number;
  color?: "teal" | "navy";
}

interface ResultCardProps {
  eyebrow: string;
  totalHours: number;
  totalLabel: string;
  eightHourDays: number;
  metrics: Metric[];
  breakdown: BreakdownItem[];
  periodLabel?: string;
  breakdownHeading?: string;
  copyText: string;
  children?: React.ReactNode;
}

export function ResultCard({
  eyebrow,
  totalHours,
  totalLabel,
  eightHourDays,
  metrics,
  breakdown,
  periodLabel,
  breakdownHeading,
  copyText,
  children,
}: ResultCardProps) {
  return (
    <section
      aria-live="polite"
      aria-atomic="true"
      className="overflow-hidden rounded-[2rem] border border-line/70 bg-surface p-5 shadow-[0_22px_60px_rgba(46,41,66,0.10)] min-[375px]:p-6 sm:p-9 lg:p-10"
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-teal">
          {eyebrow}
        </p>
        {periodLabel ? (
          <span className="rounded-full bg-wash/55 px-3 py-1 text-xs font-bold text-ink">
            {periodLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
        <strong className="min-w-0 break-words font-serif text-5xl font-bold leading-none tracking-[-0.045em] text-ink min-[375px]:text-6xl sm:text-7xl">
          {formatNumber(totalHours)}
        </strong>
        <span className="pb-1 text-xl font-semibold text-ink sm:text-2xl">{totalLabel}</span>
      </div>
      <p className="mt-3 text-base text-slate sm:text-lg">
        Approximately <strong className="font-semibold text-ink">{formatNumber(eightHourDays)}</strong>{" "}
        eight-hour days
      </p>

      <dl className="my-8 grid grid-cols-1 gap-3 min-[375px]:grid-cols-2 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-canvas px-4 py-5">
            <dt className="text-xs font-semibold uppercase leading-5 tracking-[0.08em] text-slate">
              {metric.label}
            </dt>
            <dd className="mt-2 text-xl font-bold text-ink">{metric.value}</dd>
          </div>
        ))}
      </dl>

      <TimeBreakdown
        items={breakdown}
        heading={breakdownHeading}
        ariaPeriod={periodLabel ? "over the selected schedule" : "per year"}
      />
      {children}

      <div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-line pt-6 sm:flex-row sm:items-center">
        <p className="max-w-xl text-sm leading-6 text-slate">
          This estimate is based entirely on the information you entered.
        </p>
        <CopyButton text={copyText} />
      </div>
      <p className="mt-5 text-xs leading-5 text-slate">
        Eight-hour-day equivalents are shown only to make the amount of time easier to understand. They do not represent consecutive days lost.
      </p>
    </section>
  );
}
