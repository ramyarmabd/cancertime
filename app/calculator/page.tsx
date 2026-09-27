import type { Metadata } from "next";
import { CalculatorTabs } from "@/components/CalculatorTabs";

export const metadata: Metadata = {
  title: { absolute: "CancerTime Calculator | Estimate Cancer Care Time Burden" },
  description: "Estimate treatment, transfusion, and caregiver time using information you enter.",
};

export default function CalculatorPage() {
  return (
    <>
      <section className="bg-deep text-white">
        <div className="container-shell py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">CancerTime calculators</p>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-6xl">Estimate time devoted to care</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">Choose a calculator, then view one year or set when the schedule ends. Your entries are processed locally in this browser and are not saved by CancerTime.</p>
        </div>
      </section>
      <CalculatorTabs />
    </>
  );
}
