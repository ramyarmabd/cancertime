"use client";

import { useMemo, useState } from "react";
import { DurationInput } from "@/components/DurationInput";
import { ResultCard } from "@/components/ResultCard";
import { ResultPlaceholder } from "@/components/ResultPlaceholder";
import {
  calculateCalendarPlan,
  generateScheduleDates,
  type CalendarEventInput,
  type CalendarRepeat,
} from "@/lib/calendar";
import {
  durationFieldsToHours,
  emptyDuration,
  type DurationFields,
} from "@/lib/form-values";
import { formatNumber } from "@/lib/formatting";

const categories = [
  "Treatment",
  "Imaging or scan",
  "Lab work",
  "Transfusion",
  "Appointment",
  "Other",
] as const;

const repeatOptions: Array<{ value: CalendarRepeat; label: string }> = [
  { value: "once", label: "One time" },
  { value: "week", label: "Every week" },
  { value: "two-weeks", label: "Every 2 weeks" },
  { value: "three-weeks", label: "Every 3 weeks" },
  { value: "month", label: "Every month" },
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function localIsoDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", options ?? {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDate(value));
}

function monthLabel(month: string) {
  return formatDate(`${month}-01`, { month: "long", year: "numeric" });
}

function shiftMonth(month: string, change: number) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + change, 1));
  return date.toISOString().slice(0, 7);
}

function daysForMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, monthIndex - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: days }, (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`),
  ];
}

function categoryStyle(category: string) {
  if (category === "Treatment") return "bg-action text-white";
  if (category === "Imaging or scan") return "bg-wash text-ink";
  if (category === "Lab work") return "bg-gold/55 text-ink";
  if (category === "Transfusion") return "bg-navy text-white";
  return "bg-canvas text-ink";
}

function CalendarPrintSheet({
  events,
  result,
}: {
  events: CalendarEventInput[];
  result: NonNullable<ReturnType<typeof calculateCalendarPlan>>;
}) {
  const months = [...new Set(events.map((event) => event.date.slice(0, 7)))].sort();
  const eventsByDate = new Map<string, CalendarEventInput[]>();
  events.forEach((event) => {
    const current = eventsByDate.get(event.date) ?? [];
    current.push(event);
    eventsByDate.set(event.date, current);
  });

  return (
    <section className="calendar-print-sheet" aria-hidden="true">
      <header className="calendar-print-header">
        <div>
          <p className="calendar-print-brand">CancerTime</p>
          <h1>Care calendar</h1>
          <p>{formatDate(result.firstDate)} – {formatDate(result.lastDate)}</p>
        </div>
        <dl className="calendar-print-summary">
          <div><dt>Appointments</dt><dd>{result.appointments}</dd></div>
          <div><dt>Total time</dt><dd>{formatNumber(result.totalHours)} hr</dd></div>
          <div><dt>At care locations</dt><dd>{formatNumber(result.centerHours)} hr</dd></div>
          <div><dt>Travel</dt><dd>{formatNumber(result.travelHours)} hr</dd></div>
        </dl>
      </header>

      {months.map((month) => (
        <section key={month} className="calendar-print-month">
          <h2>{monthLabel(month)}</h2>
          <div className="calendar-print-weekdays">
            {weekdays.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar-print-grid">
            {daysForMonth(month).map((date, index) => {
              if (!date) return <div key={`blank-${index}`} className="calendar-print-day calendar-print-day-empty" />;
              const dayEvents = eventsByDate.get(date) ?? [];
              return (
                <div key={date} className={`calendar-print-day ${dayEvents.length ? "calendar-print-day-active" : ""}`}>
                  <strong>{Number(date.slice(-2))}</strong>
                  {dayEvents.map((event) => (
                    <div key={event.id} className="calendar-print-event">
                      <b>{event.title}</b>
                      <span>{event.category} · {formatNumber(event.centerHours + event.travelHours)} hr</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="calendar-print-appointments">
        <h2>Appointment details</h2>
        <table>
          <thead>
            <tr><th>Date</th><th>Care</th><th>Appointment</th><th>At location</th><th>Travel</th><th>Total</th></tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{formatDate(event.date, { month: "short", day: "numeric", year: "numeric" })}</td>
                <td>{event.category}</td>
                <td>{event.title}</td>
                <td>{formatNumber(event.centerHours)} hr</td>
                <td>{formatNumber(event.travelHours)} hr</td>
                <td><strong>{formatNumber(event.centerHours + event.travelHours)} hr</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="calendar-print-footer">
        <p>Created with CancerTime from information entered by the user. Dates should be confirmed with the care team.</p>
        <p>This is an educational planning aid, not medical advice.</p>
      </footer>
    </section>
  );
}

export function CalendarCarePlanner() {
  const today = useMemo(() => localIsoDate(), []);
  const [events, setEvents] = useState<CalendarEventInput[]>([]);
  const [category, setCategory] = useState<(typeof categories)[number]>("Treatment");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [repeat, setRepeat] = useState<CalendarRepeat>("once");
  const [endMode, setEndMode] = useState<"count" | "date">("count");
  const [count, setCount] = useState("6");
  const [endDate, setEndDate] = useState("");
  const [center, setCenter] = useState<DurationFields>({ ...emptyDuration });
  const [travel, setTravel] = useState<DurationFields>({ ...emptyDuration });
  const [visibleMonth, setVisibleMonth] = useState(today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(today);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => calculateCalendarPlan(events), [events]);
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEventInput[]>();
    sortedEvents.forEach((event) => {
      const current = grouped.get(event.date) ?? [];
      current.push(event);
      grouped.set(event.date, current);
    });
    return grouped;
  }, [sortedEvents]);
  const selectedEvents = eventsByDate.get(selectedDate) ?? [];
  const monthDays = useMemo(() => daysForMonth(visibleMonth), [visibleMonth]);

  function addSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const centerHours = durationFieldsToHours(center);
    const travelHours = durationFieldsToHours(travel);
    if (!startDate || centerHours === null || travelHours === null) {
      setError("Choose a first date and enter both care-location and travel time. Use 0 when no travel is needed.");
      return;
    }

    try {
      const dates = generateScheduleDates(
        startDate,
        repeat,
        endMode === "count"
          ? { mode: "count", count: repeat === "once" ? 1 : Number(count) }
          : { mode: "date", endDate },
      );
      const scheduleId = `${Date.now()}`;
      const generated = dates.map((date, index) => ({
        id: `${scheduleId}-${index}`,
        date,
        category,
        title: title.trim() || category,
        centerHours,
        travelHours,
      }));
      setEvents((current) => [...current, ...generated]);
      setVisibleMonth(startDate.slice(0, 7));
      setSelectedDate(startDate);
      setError(null);
      setTitle("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Check the schedule details and try again.");
    }
  }

  function removeEvent(id: string) {
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  function chooseDate(date: string) {
    setSelectedDate(date);
    setStartDate(date);
  }

  const rangeLabel = result
    ? result.firstDate === result.lastDate
      ? formatDate(result.firstDate)
      : `${formatDate(result.firstDate)} – ${formatDate(result.lastDate)}`
    : undefined;
  const copyText = result
    ? `CancerTime calendar estimate\n\nScheduled period: ${rangeLabel}\nAppointments: ${result.appointments}\n${result.categories
        .map((item) => `- ${item.category}: ${item.appointments} appointment${item.appointments === 1 ? "" : "s"}, ${formatNumber(item.hours)} hours`)
        .join("\n")}\n\nEstimated time: ${formatNumber(result.totalHours)} hours total\nApproximately ${formatNumber(result.eightHourDays)} eight-hour days\n\n${formatNumber(result.centerHours)} hours at care locations\n${formatNumber(result.travelHours)} travel hours\n\nGenerated using CancerTime.`
    : "";

  return (
    <div>
      <div className="mb-5 max-w-3xl">
        <p className="section-kicker">Calendar planner</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Put care on real dates
        </h2>
        <p className="mt-2 text-base leading-7 text-slate">
          Add appointments once or as a repeating schedule, then see exactly when treatment, imaging, lab work, or other care may occur.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)] xl:gap-8">
        <form onSubmit={addSchedule} className="rounded-[2rem] border border-line/70 bg-surface p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="section-kicker">Add to calendar</p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-ink">New care schedule</h3>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-wash/45 text-xl text-teal" aria-hidden="true">+</span>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <label htmlFor="calendar-category" className="block text-base font-bold text-ink">Type of care</label>
              <select
                id="calendar-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}
                className="mt-3 h-14 w-full rounded-2xl border border-line bg-surface px-4 font-semibold text-ink shadow-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/15"
              >
                {categories.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="calendar-title" className="block text-base font-bold text-ink">Name <span className="font-normal text-slate">(optional)</span></label>
              <input
                id="calendar-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="For example, CT scan"
                maxLength={60}
                className="mt-3 h-14 w-full rounded-2xl border border-line bg-surface px-4 font-semibold text-ink shadow-sm outline-none placeholder:text-mist focus:border-teal focus:ring-4 focus:ring-teal/15"
              />
            </div>
            <div>
              <label htmlFor="calendar-date" className="block text-base font-bold text-ink">First appointment</label>
              <p className="mt-1 text-sm text-slate">You can also choose a day directly on the calendar.</p>
              <input
                id="calendar-date"
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  if (event.target.value) setVisibleMonth(event.target.value.slice(0, 7));
                }}
                className="mt-3 h-14 w-full rounded-2xl border border-line bg-surface px-4 font-semibold text-ink shadow-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/15"
              />
            </div>
            <div>
              <label htmlFor="calendar-repeat" className="block text-base font-bold text-ink">Repeat</label>
              <select
                id="calendar-repeat"
                value={repeat}
                onChange={(event) => setRepeat(event.target.value as CalendarRepeat)}
                className="mt-3 h-14 w-full rounded-2xl border border-line bg-surface px-4 font-semibold text-ink shadow-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/15"
              >
                {repeatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>

            {repeat !== "once" ? (
              <fieldset className="rounded-2xl bg-canvas p-4">
                <legend className="px-1 text-base font-bold text-ink">Schedule ends</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["count", "date"] as const).map((mode) => (
                    <label key={mode} className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-bold ${endMode === mode ? "border-teal bg-surface text-ink" : "border-line text-slate"}`}>
                      <input type="radio" name="calendar-end" value={mode} checked={endMode === mode} onChange={() => setEndMode(mode)} className="sr-only" />
                      {mode === "count" ? "After visits" : "On a date"}
                    </label>
                  ))}
                </div>
                {endMode === "count" ? (
                  <label className="mt-3 block text-sm font-semibold text-ink">
                    Number of appointments
                    <input type="number" min={1} max={200} value={count} onChange={(event) => setCount(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-3 text-base font-semibold outline-none focus:border-teal focus:ring-4 focus:ring-teal/15" />
                  </label>
                ) : (
                  <label className="mt-3 block text-sm font-semibold text-ink">
                    Last appointment on or before
                    <input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-3 text-base font-semibold outline-none focus:border-teal focus:ring-4 focus:ring-teal/15" />
                  </label>
                )}
              </fieldset>
            ) : null}

            <DurationInput id="calendar-center" label="Time at the care location" helpText="Include check-in, waiting, and the appointment itself." fields={center} onChange={setCenter} />
            <DurationInput id="calendar-travel" label="Round-trip travel" helpText="Enter 0 hours when no travel is needed." fields={travel} onChange={setTravel} />
          </div>

          {error ? <p role="alert" className="mt-5 rounded-2xl bg-gold/25 p-4 text-sm font-semibold leading-6 text-ink">{error}</p> : null}
          <button type="submit" className="button-primary mt-7 w-full">Add schedule to calendar <span aria-hidden="true">→</span></button>
          <p className="mt-4 text-center text-xs leading-5 text-slate">Calendar entries stay only in this browser tab and are not sent anywhere.</p>
        </form>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-line/70 bg-surface p-4 shadow-sm min-[375px]:p-5 sm:p-7" aria-label="Care calendar">
            <div className="mb-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">Printable care plan</p>
                <p className="mt-1 text-sm leading-6 text-slate">Print every scheduled month and appointment detail, or save it as a PDF.</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!result}
                className="button-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span aria-hidden="true">▤</span>
                Print / save PDF
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => setVisibleMonth((month) => shiftMonth(month, -1))} className="button-secondary size-11 !p-0" aria-label="Previous month">←</button>
              <div className="text-center">
                <p className="font-serif text-2xl font-bold text-ink sm:text-3xl">{monthLabel(visibleMonth)}</p>
                <button type="button" onClick={() => setVisibleMonth(today.slice(0, 7))} className="mt-1 text-xs font-bold text-teal hover:underline">Today</button>
              </div>
              <button type="button" onClick={() => setVisibleMonth((month) => shiftMonth(month, 1))} className="button-secondary size-11 !p-0" aria-label="Next month">→</button>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-bold uppercase tracking-wide text-slate sm:gap-2 sm:text-xs">
              {weekdays.map((day) => <div key={day} className="py-1">{day}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-2">
              {monthDays.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} aria-hidden="true" className="min-h-14 sm:min-h-24" />;
                const dayEvents = eventsByDate.get(date) ?? [];
                const isSelected = selectedDate === date;
                const isToday = today === date;
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => chooseDate(date)}
                    aria-label={`${formatDate(date, { month: "long", day: "numeric", year: "numeric" })}${dayEvents.length ? `, ${dayEvents.length} scheduled` : ""}`}
                    className={`min-h-14 overflow-hidden rounded-xl border p-1 text-left outline-none transition focus-visible:ring-4 focus-visible:ring-teal/20 sm:min-h-24 sm:rounded-2xl sm:p-2 ${isSelected ? "border-teal bg-wash/35" : "border-line/60 hover:border-teal"}`}
                  >
                    <span className={`grid size-7 place-items-center rounded-full text-xs font-bold sm:size-8 sm:text-sm ${isToday ? "bg-action text-white" : "text-ink"}`}>{Number(date.slice(-2))}</span>
                    <span className="mt-1 flex flex-wrap gap-1 sm:hidden" aria-hidden="true">
                      {dayEvents.slice(0, 3).map((item) => <span key={item.id} className={`size-1.5 rounded-full ${item.category === "Imaging or scan" ? "bg-wash" : item.category === "Transfusion" ? "bg-navy" : "bg-teal"}`} />)}
                    </span>
                    <span className="mt-1 hidden space-y-1 sm:block" aria-hidden="true">
                      {dayEvents.slice(0, 2).map((item) => <span key={item.id} className={`block truncate rounded-md px-1.5 py-1 text-[0.65rem] font-bold ${categoryStyle(item.category)}`}>{item.title}</span>)}
                      {dayEvents.length > 2 ? <span className="block px-1 text-[0.65rem] font-semibold text-slate">+{dayEvents.length - 2} more</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-ink">{formatDate(selectedDate, { weekday: "long", month: "long", day: "numeric" })}</h3>
                <span className="text-xs font-semibold text-slate">{selectedEvents.length} scheduled</span>
              </div>
              {selectedEvents.length ? (
                <ul className="mt-3 space-y-2">
                  {selectedEvents.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-canvas p-3">
                      <div className="min-w-0">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[0.68rem] font-bold ${categoryStyle(item.category)}`}>{item.category}</span>
                        <strong className="mt-1 block truncate text-sm text-ink">{item.title}</strong>
                        <span className="text-xs text-slate">{formatNumber(item.centerHours + item.travelHours)} hours including travel</span>
                      </div>
                      <button type="button" onClick={() => removeEvent(item.id)} className="button-secondary shrink-0 !min-h-10 !px-3" aria-label={`Remove ${item.title} on ${formatDate(item.date)}`}>Remove</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-2xl bg-canvas p-4 text-sm leading-6 text-slate">No care is scheduled on this day. Select it to use it as the first date for a new schedule.</p>
              )}
            </div>
          </section>

          {result ? (
            <ResultCard
              eyebrow="Your calendar estimate"
              periodLabel={rangeLabel}
              totalHours={result.totalHours}
              totalLabel="hours total"
              eightHourDays={result.eightHourDays}
              metrics={[
                { label: "Appointments", value: formatNumber(result.appointments) },
                { label: "Types of care", value: formatNumber(result.categories.length) },
                { label: "Care-location time", value: `${formatNumber(result.centerHours)} hr` },
                { label: "Travel time", value: `${formatNumber(result.travelHours)} hr` },
              ]}
              breakdown={[
                { label: "Care locations", value: result.centerHours },
                { label: "Travel", value: result.travelHours, color: "navy" },
              ]}
              breakdownHeading="Where the scheduled time goes"
              copyText={copyText}
              imageExport={false}
            >
              <div className="mt-7 border-t border-line pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate">Time by care type</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {result.categories.map((item) => (
                    <li key={item.category} className="flex justify-between gap-3 rounded-xl bg-canvas px-3 py-2 text-sm">
                      <span className="text-ink">{item.category} · {item.appointments}</span>
                      <strong className="shrink-0 text-ink">{formatNumber(item.hours)} hr</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </ResultCard>
          ) : (
            <ResultPlaceholder prompt="Add an appointment or repeating schedule to see the exact-date estimate." />
          )}

          {events.length ? (
            <button type="button" onClick={() => setEvents([])} className="button-secondary">Clear the entire calendar</button>
          ) : null}
        </div>
      </div>

      {result ? <CalendarPrintSheet events={sortedEvents} result={result} /> : null}
    </div>
  );
}
