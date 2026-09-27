import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "About CancerTime" },
  description: "Learn about the purpose, privacy approach, and educational scope of CancerTime.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-shell py-14 sm:py-20">
          <p className="section-kicker">About the project</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-bold tracking-tight text-ink sm:text-6xl">Making the time demands of cancer care easier to understand.</h1>
        </div>
      </section>

      <div className="container-shell py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.65fr)] lg:gap-20">
          <div className="max-w-3xl">
            <p className="text-xl leading-8 text-ink">CancerTime was created to make the time demands of cancer care easier to understand.</p>
            <p className="mt-6 leading-8 text-slate">Cancer treatment often requires repeated clinic visits, travel, infusions, transfusions, laboratory testing, and support from family members and caregivers.</p>
            <p className="mt-6 leading-8 text-slate">CancerTime translates these recurring commitments into simple estimates of hours per month and per year.</p>
            <p className="mt-6 leading-8 text-slate">The project focuses on the concept of time burden in cancer care and is intended for educational and research purposes.</p>

            <section className="mt-14 border-t border-line pt-12" aria-labelledby="privacy-title">
              <p className="section-kicker">Privacy</p>
              <h2 id="privacy-title" className="mt-3 font-serif text-3xl font-bold text-ink">Calculations stay in your browser</h2>
              <div className="mt-6 space-y-4 leading-7 text-slate">
                <p>Calculations are performed locally in your browser.</p>
                <p>CancerTime does not require your name, date of birth, medical record number, diagnosis, or other identifying information.</p>
                <p>We do not intentionally collect the values entered into the calculators.</p>
                <p>Only your light or dark display preference may be saved locally on this device. Calculator entries are not included in that preference.</p>
                <p>No account, cookies, analytics, or external calculation service is used in this version of the site.</p>
              </div>
            </section>

            <section className="mt-14 border-t border-line pt-12" aria-labelledby="scope-title">
              <p className="section-kicker">Scope</p>
              <h2 id="scope-title" className="mt-3 font-serif text-3xl font-bold text-ink">An estimate, not medical guidance</h2>
              <p className="mt-6 leading-7 text-slate">CancerTime is an educational and research-oriented tool that provides estimates based on information entered by the user. It does not provide medical advice, determine treatment decisions, compare treatment effectiveness, or replace discussion with a healthcare professional.</p>
            </section>
          </div>

          <aside className="rounded-b-[2rem] border-t-4 border-teal bg-surface p-7 shadow-[0_12px_36px_rgba(16,40,61,0.07)] lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate">Project information</p>
            <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
              <div className="py-4"><dt className="font-semibold text-slate">Creator</dt><dd className="mt-1 text-ink">[Name]</dd></div>
              <div className="py-4"><dt className="font-semibold text-slate">Institution</dt><dd className="mt-1 text-ink">[Institution]</dd></div>
              <div className="py-4"><dt className="font-semibold text-slate">Contact</dt><dd className="mt-1 text-ink">[Email]</dd></div>
            </dl>
            <p className="mt-5 text-xs leading-5 text-slate">Placeholders are intentionally retained until verified project information is available.</p>
            <Link href="/calculator" className="button-primary mt-7 w-full">Use CancerTime</Link>
          </aside>
        </div>
      </div>
    </>
  );
}
