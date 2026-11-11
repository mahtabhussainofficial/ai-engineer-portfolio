export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      className="bg-grid-canvas min-h-screen px-4 pt-6 pb-10 text-foreground sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading page content...</span>

      <div className="mx-auto flex w-full max-w-7xl animate-pulse flex-col gap-8 sm:gap-10">
        {/* Top bar skeleton */}
        <div className="nav-glass flex h-14 items-center justify-between rounded-2xl px-6">
          <div className="h-4 w-28 rounded bg-[#172130]" />
          <div className="hidden gap-3 md:flex">
            <div className="h-7 w-16 rounded-lg bg-[#172130]" />
            <div className="h-7 w-16 rounded-lg bg-[#172130]" />
            <div className="h-7 w-20 rounded-lg bg-[#172130]" />
            <div className="h-7 w-20 rounded-lg bg-[#172130]" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-[#172130]" />
        </div>

        {/* Hero / Header frame skeleton */}
        <div className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="h-3 w-36 rounded bg-[#172130]" />
          <div className="mt-5 h-11 w-full max-w-xl rounded bg-[#172130]" />
          <div className="mt-4 h-5 w-full max-w-2xl rounded bg-[#172130]" />
          <div className="mt-2 h-5 w-full max-w-lg rounded bg-[#172130]" />
          <div className="mt-8 flex gap-3">
            <div className="h-11 w-36 rounded-lg bg-[#172130]" />
            <div className="h-11 w-32 rounded-lg bg-[#172130]" />
          </div>
        </div>

        {/* Cards grid skeleton */}
        <div className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="surface-card h-56 rounded-xl" />
            <div className="surface-card h-56 rounded-xl" />
            <div className="surface-card h-56 rounded-xl md:col-span-2 lg:col-span-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
