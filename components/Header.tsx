import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-surface/90 backdrop-blur-xl">
      <div className="container-shell">
        <div className="flex min-h-20 items-center justify-between gap-3 py-3">
          <Link href="/" className="group inline-flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-teal/20">
            <span aria-hidden="true" className="relative grid size-11 place-items-center rounded-2xl border border-teal/25 bg-teal/8 text-teal shadow-sm">
              <svg viewBox="0 0 32 32" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="16" cy="16" r="10.5" />
                <path d="M16 9.5V16l4.5 3M7 16h2M23 16h2" />
              </svg>
            </span>
            <span>
              <span className="block font-serif text-xl font-bold tracking-tight text-ink">CancerTime</span>
              <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate lg:block">Understanding the time burden of cancer care</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <nav aria-label="Primary navigation" className="hidden sm:flex">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-semibold text-slate outline-none transition hover:bg-canvas hover:text-teal focus-visible:bg-teal/8 focus-visible:text-teal md:px-4">
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
        <nav aria-label="Primary navigation" className="-mx-1 grid grid-cols-4 border-t border-line py-1 sm:hidden">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-h-11 items-center justify-center rounded-full px-0.5 text-[0.7rem] font-semibold text-slate outline-none transition hover:bg-canvas hover:text-teal focus-visible:bg-teal/8 focus-visible:text-teal min-[375px]:px-1 min-[375px]:text-[0.82rem]">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
