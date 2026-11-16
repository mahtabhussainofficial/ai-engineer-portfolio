import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "../components/site-shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#050507] text-white selection:bg-[#c4f042] selection:text-black">
      {/* Top subtle ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_60%_400px_at_50%_-50px,rgba(196,240,66,0.04),transparent)]"
      />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <SiteHeader />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
