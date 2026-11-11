import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "../components/site-shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-grid-canvas flex min-h-screen flex-1 flex-col overflow-x-clip text-foreground">
      <SiteHeader />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pt-4 pb-8 sm:gap-10 sm:px-6 sm:pt-6 lg:px-8"
      >
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
