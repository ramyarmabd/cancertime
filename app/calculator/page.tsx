import type { Metadata } from "next";
import { CalculatorTabs } from "@/components/CalculatorTabs";

export const metadata: Metadata = {
  title: { absolute: "CancerTime Calculator | Estimate Cancer Care Time Burden" },
  description: "Estimate treatment, transfusion, caregiver, combined care, and exact-date calendar time using information you enter.",
};

export default function CalculatorPage() {
  return (
    <>
      <section className="bg-deep text-white">
        <div className="container-shell py-8 sm:py-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">CancerTime calculators</p>
          <h1 className="mt-2 max-w-4xl font-serif text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">Estimate time devoted to care</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-white/75">Choose a calculator and enter a typical schedule. Your numbers stay in this browser.</p>
        </div>
      </section>
      <CalculatorTabs />
    </>
  );
}
