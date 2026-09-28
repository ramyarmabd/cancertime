import Link from "next/link";

const calculators = [
  {
    number: "01",
    title: "Combined Care Planner",
    description: "Add treatment, labs, scans, transfusions, and other visits in one estimate.",
    href: "/calculator#planner",
    link: "Plan combined care",
  },
  {
    number: "02",
    title: "Treatment Time",
    description: "Estimate the time spent traveling to and receiving cancer treatment.",
    href: "/calculator#treatment",
    link: "Estimate treatment time",
  },
  {
    number: "03",
    title: "Transfusion Time",
    description: "Estimate the time associated with blood transfusion visits.",
    href: "/calculator#transfusion",
    link: "Estimate transfusion time",
  },
  {
    number: "04",
    title: "Caregiver Time",
    description: "Estimate the time family members or caregivers spend supporting cancer-related care.",
    href: "/calculator#caregiver",
    link: "Estimate caregiver time",
  },
];

const privacyPoints = [
  {
    title: "No account required",
    description: "Begin with an empty calculator. No sign-in or registration is needed.",
  },
  {
    title: "No identifying information",
    description: "We do not ask for names, dates of birth, diagnoses, or medical record details.",
  },
  {
    title: "Browser-only calculations",
    description: "The numbers you enter are calculated locally on your device and are not intentionally collected.",
  },
  {
    title: "Descriptive, not medical",
    description: "CancerTime estimates time burden. It does not provide or influence medical advice.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-canvas">
        <div aria-hidden="true" className="absolute inset-y-10 right-0 hidden w-[37%] rounded-l-[5rem] bg-wash lg:block" />
        <div className="container-shell relative grid min-h-[38rem] items-center gap-14 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div className="max-w-3xl">
            <p className="section-kicker">Cancer care time calculator</p>
            <h1 className="mt-6 max-w-[13ch] font-serif text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-ink min-[375px]:text-6xl sm:text-7xl lg:text-[5rem]">
              How much time does cancer care take?
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-slate sm:mt-8">
              Cancer treatment involves more than medications. Travel, appointments, infusions, transfusions, and caregiving all require time.
            </p>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate sm:mt-4">
              CancerTime provides simple estimates of the time devoted to cancer-related care.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5 sm:mt-9">
              <Link href="/calculator" className="button-primary">
                Calculate Your Time
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/methodology" className="rounded-full px-2 py-3 text-base font-bold text-teal outline-none hover:bg-surface/60 focus-visible:ring-4 focus-visible:ring-teal/20">
                How it works
              </Link>
            </div>
          </div>

          <div className="relative rounded-[2.5rem] border border-line/60 bg-surface/90 p-6 shadow-[0_28px_80px_rgba(46,41,66,0.14)] backdrop-blur min-[375px]:p-7 sm:p-10 lg:ml-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal">Example result</p>
              <span className="rounded-full bg-wash/45 px-3 py-1 text-xs font-bold text-ink">1 year</span>
            </div>
            <p className="mt-6 text-sm leading-6 text-slate">Four visits each month, with 3 hours at the clinic and 1 hour of round-trip travel.</p>
            <div className="mt-5 flex flex-wrap items-end gap-2">
              <strong className="font-serif text-6xl font-bold leading-none tracking-[-0.045em] text-ink">192</strong>
              <span className="pb-1 text-xl font-semibold text-ink">hours/year</span>
            </div>
            <p className="mt-3 text-sm text-slate">Equivalent to 24 eight-hour days</p>
            <div className="mt-7 flex h-4 overflow-hidden rounded-full bg-wash" aria-label="Example breakdown: Clinic 75 percent, Travel 25 percent" role="img">
              <span className="h-full w-3/4 bg-teal" />
              <span className="h-full w-1/4 bg-navy" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-canvas px-4 py-3"><strong className="block text-ink">Clinic · 75%</strong><span className="text-slate">144 hours</span></div>
              <div className="rounded-2xl bg-canvas px-4 py-3"><strong className="block text-ink">Travel · 25%</strong><span className="text-slate">48 hours</span></div>
            </div>
            <Link href="/calculator#treatment" className="mt-6 inline-flex items-center gap-2 font-bold text-teal outline-none hover:gap-3 focus-visible:ring-4 focus-visible:ring-teal/20">
              Try your own schedule <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="container-shell py-20 sm:py-28" aria-labelledby="choose-calculator">
        <div className="max-w-3xl">
          <p className="section-kicker">Four ways to estimate</p>
          <h2 id="choose-calculator" className="mt-4 font-serif text-5xl font-bold tracking-tight text-ink sm:text-6xl">Choose a calculator</h2>
          <p className="mt-5 text-lg leading-8 text-slate">Each calculator uses only the schedule details you provide. Start with whichever estimate is most useful to you.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {calculators.map((calculator, index) => (
            <article key={calculator.title} className={`rounded-[2rem] border border-line/60 p-7 shadow-sm sm:p-8 ${index === 1 ? "bg-wash/35" : index === 2 ? "bg-gold/25" : "bg-surface"}`}>
              <p className="font-serif text-sm font-bold text-teal">{calculator.number}</p>
              <h3 className="mt-8 font-serif text-3xl font-bold text-ink">{calculator.title}</h3>
              <p className="mt-4 min-h-20 text-base leading-7 text-slate">{calculator.description}</p>
              <Link href={calculator.href} className="mt-8 inline-flex items-center gap-2 rounded-full px-1 py-2 text-base font-bold text-teal outline-none hover:gap-3 focus-visible:ring-4 focus-visible:ring-teal/20">
                {calculator.link} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell pb-20 sm:pb-28" aria-labelledby="privacy-heading">
        <div className="grid gap-10 rounded-[2.75rem] bg-surface p-6 shadow-sm min-[375px]:p-7 sm:p-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:p-16">
          <div>
            <p className="section-kicker">Designed for privacy</p>
            <h2 id="privacy-heading" className="mt-4 font-serif text-5xl font-bold tracking-tight text-ink">Your numbers stay with you.</h2>
            <p className="mt-6 text-lg leading-8 text-slate">CancerTime is intentionally simple. It does not use accounts, trackers, patient records, or external calculation services.</p>
          </div>
          <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
            {privacyPoints.map((point) => (
              <div key={point.title} className="border-t border-line py-5">
                <h3 className="text-lg font-bold text-ink">{point.title}</h3>
                <p className="mt-2 text-base leading-7 text-slate">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-14 text-center sm:py-16">
        <p className="mx-auto max-w-3xl text-sm leading-7 text-slate">
          CancerTime estimates time from the information entered. It does not recommend treatments, interpret medical results, diagnose conditions, or provide medical advice.
        </p>
      </section>
    </>
  );
}
