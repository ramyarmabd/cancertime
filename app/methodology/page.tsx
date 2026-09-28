import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "CancerTime Methodology" },
  description: "Learn how CancerTime calculates treatment, transfusion, and caregiver time estimates.",
};

const treatmentEquations = [
  ["Annual visits", "monthly visits × 12"],
  ["Annual clinic time", "annual visits × clinic hours per visit"],
  ["Annual travel time", "annual visits × round-trip travel hours"],
  ["Annual time burden", "annual clinic time + annual travel time"],
  ["Eight-hour-day equivalent", "annual hours ÷ 8"],
];

const limitations = [
  "waiting for prescriptions",
  "time spent scheduling appointments",
  "insurance-related tasks",
  "phone calls and portal messages",
  "hospitalization unless entered separately",
  "unexpected visits",
  "recovery time at home",
  "emotional burden",
  "financial burden",
];

export default function MethodologyPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-shell py-14 sm:py-20">
          <p className="section-kicker">Transparent by design</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-bold tracking-tight text-ink sm:text-6xl">How CancerTime calculates an estimate</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate">The calculations use simple multiplication and addition. Every estimate is based only on the numbers entered by the user.</p>
        </div>
      </section>

      <div className="container-shell py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20">
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start" aria-label="On this page">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate">On this page</p>
            <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 text-sm font-semibold text-slate lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-line lg:px-0 lg:pb-0">
              <a href="#treatment" className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 hover:border-teal hover:text-teal lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-l-transparent lg:bg-transparent">Treatment & transfusion</a>
              <a href="#frequency" className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 hover:border-teal hover:text-teal lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-l-transparent lg:bg-transparent">Visit frequency</a>
              <a href="#combined" className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 hover:border-teal hover:text-teal lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-l-transparent lg:bg-transparent">Combined planner</a>
              <a href="#caregiver" className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 hover:border-teal hover:text-teal lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-l-transparent lg:bg-transparent">Caregiver time</a>
              <a href="#schedule-range" className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 hover:border-teal hover:text-teal lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-l-transparent lg:bg-transparent">Estimate period</a>
              <a href="#example" className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 hover:border-teal hover:text-teal lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-l-transparent lg:bg-transparent">Worked example</a>
              <a href="#limitations" className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 hover:border-teal hover:text-teal lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-l-transparent lg:bg-transparent">Limitations</a>
              <a href="#references" className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 hover:border-teal hover:text-teal lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-l-transparent lg:bg-transparent">References</a>
            </nav>
          </aside>

          <div className="max-w-3xl">
            <section id="treatment" className="scroll-mt-6">
              <p className="section-kicker">Treatment and transfusion time</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-ink">The same visit-time model</h2>
              <p className="mt-4 leading-7 text-slate">Treatment and transfusion estimates combine time at the care center with round-trip travel time. The transfusion calculator uses the same equations with transfusion-specific labels.</p>
              <dl className="mt-8 border-t border-line">
                {treatmentEquations.map(([term, equation]) => (
                  <div key={term} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[0.9fr_1.1fr] sm:gap-8">
                    <dt className="font-semibold text-ink">{term}</dt>
                    <dd className="font-mono text-sm leading-6 text-teal">{equation}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm leading-6 text-slate">If the transfusion accompaniment option is selected, caregiver hours equal the patient’s estimated visit and travel hours. Combined person-hours add both people’s time without suggesting the patient personally spends the combined amount.</p>
            </section>

            <section id="frequency" className="mt-16 scroll-mt-28 border-t border-line pt-14">
              <p className="section-kicker">Visit frequency</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-ink">Converting schedules to a monthly average</h2>
              <p className="mt-5 leading-8 text-slate">CancerTime accepts common schedules and converts them to an average number of visits per month before estimating totals.</p>
              <dl className="mt-8 border-t border-line">
                {[
                  ["Each week", "visits × 52 weeks ÷ 12 months"],
                  ["Every 2 weeks", "visits × 26 intervals ÷ 12 months"],
                  ["Every 3 weeks", "visits × (52 ÷ 3) intervals ÷ 12 months"],
                  ["Each month", "visits entered directly"],
                ].map(([term, equation]) => (
                  <div key={term} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[0.9fr_1.1fr] sm:gap-8">
                    <dt className="font-semibold text-ink">{term}</dt>
                    <dd className="font-mono text-sm leading-6 text-teal">{equation}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm leading-6 text-slate">These conversions describe an average. Actual calendar months contain different numbers of days and appointments may be rescheduled.</p>
            </section>

            <section id="combined" className="mt-16 scroll-mt-28 border-t border-line pt-14">
              <p className="section-kicker">Combined care planner</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-ink">Adding several types of care</h2>
              <p className="mt-5 leading-8 text-slate">Each activity—such as treatment, lab work, imaging, or transfusion—is calculated from its own frequency and duration. CancerTime then adds care-location time and travel across all rows.</p>
              <div className="mt-7 rounded-3xl bg-wash/35 p-6 text-sm leading-7 text-slate">
                <p><strong className="text-ink">Grouped trips:</strong> when an activity is marked as happening on the same trip as the row above, its care-location time is included but its travel time is set to zero. This avoids intentionally counting the same trip twice.</p>
                <p className="mt-3">Only group rows when those activities usually happen together. The planner does not infer shared trips automatically.</p>
              </div>
            </section>

            <section id="caregiver" className="mt-16 scroll-mt-6 border-t border-line pt-14">
              <p className="section-kicker">Caregiver time</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-ink">Visit-related and additional support</h2>
              <dl className="mt-8 border-t border-line">
                {[
                  ["Annual visit-related time", "visits per month × hours per visit × 12"],
                  ["Annual additional time", "additional hours per week × 52"],
                  ["Annual caregiver time", "visit-related time + additional time"],
                  ["Monthly average", "annual caregiver time ÷ 12"],
                  ["Eight-hour-day equivalent", "annual caregiver hours ÷ 8"],
                ].map(([term, equation]) => (
                  <div key={term} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[0.9fr_1.1fr] sm:gap-8">
                    <dt className="font-semibold text-ink">{term}</dt>
                    <dd className="font-mono text-sm leading-6 text-teal">{equation}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section id="schedule-range" className="mt-16 scroll-mt-28 border-t border-line pt-14">
              <p className="section-kicker">Estimate period</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-ink">One month, one year, or a defined course</h2>
              <p className="mt-5 leading-8 text-slate">Every calculator asks which period the total should cover. One month provides a short-term view, one year provides an annual view, and a defined course estimates time through a chosen end point.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ["Visits", "Uses the number of visits directly. Estimated elapsed months = total visits ÷ visits per month."],
                  ["Weeks", "Converts weeks using 52 weeks per year, then estimates visits and care time in that period."],
                  ["Months", "Multiplies monthly visit frequency by the selected number of months."],
                  ["Years", "Converts years to months and applies the entered monthly schedule."],
                ].map(([unit, description]) => (
                  <div key={unit} className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-ink">Ends after {unit.toLowerCase()}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate">{description}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 rounded-3xl bg-wash/35 p-5 text-sm leading-7 text-slate">For caregiver estimates, visit-related time follows the estimated number of visits. Additional weekly caregiving time is scaled across the same period. A visit-based end point requires more than zero visits per month so elapsed time can be estimated.</p>
            </section>

            <section id="example" className="mt-16 scroll-mt-6 border-t border-line pt-14">
              <p className="section-kicker">Worked example</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-ink">Three treatment visits per month</h2>
              <p className="mt-4 leading-7 text-slate">Suppose each visit includes 5 hours at the clinic and 1.5 hours of round-trip travel.</p>
              <div className="mt-7 border-l-4 border-teal bg-surface p-6 sm:p-8">
                <div className="space-y-5 font-mono text-sm leading-6">
                  <p><strong className="font-sans text-ink">Annual visits:</strong><br /><span className="text-teal">3 × 12 = 36 visits</span></p>
                  <p><strong className="font-sans text-ink">Clinic time:</strong><br /><span className="text-teal">36 × 5 = 180 hours</span></p>
                  <p><strong className="font-sans text-ink">Travel time:</strong><br /><span className="text-teal">36 × 1.5 = 54 hours</span></p>
                  <p><strong className="font-sans text-ink">Total:</strong><br /><span className="text-teal">180 + 54 = 234 hours/year</span></p>
                  <p><strong className="font-sans text-ink">Eight-hour-day equivalent:</strong><br /><span className="text-teal">234 ÷ 8 = 29.25 days</span></p>
                </div>
              </div>
            </section>

            <section id="limitations" className="mt-16 scroll-mt-6 border-t border-line pt-14">
              <p className="section-kicker">Limitations</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-ink">What CancerTime does not include</h2>
              <p className="mt-4 leading-7 text-slate">Depending on what is entered, the calculations may not capture:</p>
              <ul className="mt-6 grid gap-x-8 gap-y-3 text-sm text-slate sm:grid-cols-2">
                {limitations.map((item) => (
                  <li key={item} className="flex gap-3 border-t border-line pt-3"><span aria-hidden="true" className="text-teal">—</span><span>{item}</span></li>
                ))}
              </ul>
              <div className="mt-9 border-l-4 border-navy bg-wash p-6 text-sm leading-7 text-slate">
                <p>CancerTime calculates time burden based only on the numbers entered by the user. It does not measure quality of life.</p>
                <p className="mt-3">The eight-hour-day equivalent is a way to make hours easier to understand. It does not represent consecutive days lost.</p>
              </div>
            </section>

            <section id="references" className="mt-16 scroll-mt-28 border-t border-line pt-14">
              <p className="section-kicker">Research context</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-ink">Selected reference</h2>
              <p className="mt-5 leading-8 text-slate">
                The concept of <em>time toxicity</em> describes the time people may spend coordinating care, traveling, waiting, attending healthcare visits, receiving follow-up testing, or seeking care for treatment-related effects. The following article provides important context for making this burden more visible in cancer research and care.
              </p>
              <article className="mt-8 rounded-[2rem] border border-line/70 bg-surface p-6 shadow-sm sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-teal">Journal article</p>
                <h3 className="mt-3 font-serif text-2xl font-bold text-ink">The Time Toxicity of Cancer Treatment</h3>
                <p className="mt-3 leading-7 text-slate">
                  Gupta A, Eisenhauer EA, Booth CM. <em>Journal of Clinical Oncology.</em> 2022;40(15):1611–1615.
                </p>
                <a
                  href="https://ascopubs.org/doi/10.1200/JCO.21.02810"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-1 py-2 font-bold text-teal outline-none hover:gap-3 focus-visible:ring-4 focus-visible:ring-teal/20"
                >
                  Read the article at ASCO Publications <span aria-hidden="true">↗</span>
                </a>
                <p className="mt-5 border-t border-line pt-5 text-sm leading-7 text-slate">
                  DOI: 10.1200/JCO.21.02810
                </p>
              </article>
              <p className="mt-6 rounded-3xl bg-wash/35 p-5 text-sm leading-7 text-slate">
                This reference provides research context for CancerTime. It is not the source of a treatment recommendation or a fixed clinical formula; calculator results are simple estimates based only on the values entered by the user.
              </p>
            </section>

            <section className="mt-16 border-t border-line pt-14">
              <h2 className="font-serif text-3xl font-bold text-ink">Educational and research-oriented</h2>
              <p className="mt-4 leading-7 text-slate">CancerTime provides estimates based on information entered by the user. It does not provide medical advice, determine treatment decisions, compare treatment effectiveness, or replace discussion with a healthcare professional.</p>
              <Link href="/calculator" className="button-primary mt-7">Open the calculators <span aria-hidden="true">→</span></Link>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
