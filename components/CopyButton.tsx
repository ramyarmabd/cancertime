"use client";

import { useEffect, useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timeout = window.setTimeout(() => setStatus("idle"), 2400);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={copySummary} className="button-secondary">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="8" y="8" width="11" height="11" rx="1" />
          <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
        </svg>
        {status === "copied" ? "Copied" : "Copy summary"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied"
          ? "Summary copied to clipboard."
          : status === "error"
            ? "Summary could not be copied."
            : ""}
      </span>
    </div>
  );
}
