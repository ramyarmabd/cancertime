import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-deep text-white">
      <div className="container-shell py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <Link href="/" className="font-serif text-xl font-bold outline-none focus-visible:ring-3 focus-visible:ring-white/40">CancerTime</Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">A simple way to estimate the time devoted to cancer-related care.</p>
            <div className="mt-5 flex gap-5 text-sm font-semibold text-white/75">
              <Link href="/methodology" className="hover:text-white">Methodology</Link>
              <Link href="/about" className="hover:text-white">About & privacy</Link>
            </div>
          </div>
          <p className="border-t border-white/15 pt-6 text-sm leading-6 text-white/70 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            CancerTime is an educational and research-oriented tool that provides estimates based on information entered by the user. It does not provide medical advice, determine treatment decisions, compare treatment effectiveness, or replace discussion with a healthcare professional.
          </p>
        </div>
      </div>
    </footer>
  );
}
