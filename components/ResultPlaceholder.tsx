export function ResultPlaceholder({ calculator }: { calculator: string }) {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-[2rem] border border-dashed border-line bg-surface/70 p-6 text-center shadow-sm sm:p-8">
      <div className="max-w-sm">
        <svg aria-hidden="true" viewBox="0 0 48 48" className="mx-auto size-11 text-teal" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="24" cy="24" r="19" />
          <path d="M24 13v12l8 5" />
        </svg>
        <p className="mt-5 font-serif text-2xl font-bold text-ink">Your estimate will appear here</p>
        <p className="mt-3 text-base leading-7 text-slate">
          Complete all {calculator} fields with valid values. Zero is accepted.
        </p>
      </div>
    </div>
  );
}
