"use client";

import { useState } from "react";

export function DirectEmailCard({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-800/80 bg-[#0c0d12] p-6 sm:p-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#c4f042]">
          Direct Email
        </span>
        <a
          href={`mailto:${email}`}
          className="mt-1 block text-xl sm:text-2xl font-bold text-white hover:text-[#c4f042] transition-colors"
        >
          {email}
        </a>
        <p className="mt-1 text-xs text-zinc-400">
          Feel free to reach out directly with your project inquiries.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-zinc-700 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:border-[#c4f042]/50 hover:bg-[#c4f042]/10 hover:text-[#c4f042] active:scale-95"
        >
          {copied ? "Copied! ✓" : "Copy email"}
        </button>

        <a
          href={`mailto:${email}`}
          className="rounded-full bg-[#c4f042] px-5 py-2 text-xs font-bold text-zinc-950 transition-all hover:bg-[#b2e232] active:scale-95"
        >
          Open email app →
        </a>
      </div>
    </div>
  );
}
