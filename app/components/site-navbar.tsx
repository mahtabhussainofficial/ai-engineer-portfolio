"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

export interface NavItem {
  label: string;
  href: string;
}

function PathnameWatcher({
  onNavigate,
}: {
  onNavigate: (pathname: string) => void;
}) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onNavigate(pathname);
    }
  }, [pathname, onNavigate]);

  return null;
}

function resolveActiveFromPath(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/about")) return "About";
  if (pathname.startsWith("/services")) return "Services";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/skills")) return "Skills";
  if (pathname.startsWith("/contact")) return "Contact";
  return undefined;
}

function DesktopNavLinks({
  primaryItems,
  contactItem,
  currentActive,
}: {
  primaryItems: readonly NavItem[];
  contactItem: NavItem;
  currentActive?: string;
}) {
  return (
    <>
      {/* Center Nav Links - Clear typography with modern pill states */}
      <div className="hidden items-center gap-1 xl:gap-1.5 md:flex">
        {primaryItems.map((item) => {
          const isActive = currentActive === item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-xs xl:px-4 xl:py-2 xl:text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4f042] shrink-0 ${
                isActive
                  ? "border border-white/15 bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right Controls - Status badge + Vibrant CTA */}
      <div className="hidden items-center gap-2.5 xl:gap-3.5 sm:flex shrink-0">
        {/* Availability Badge */}
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-zinc-300 xl:inline-flex shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c4f042] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c4f042]" />
          </span>
          <span className="font-semibold tracking-wide">Available for work</span>
        </div>

        {/* Contact CTA */}
        <Link
          href={contactItem.href}
          prefetch={true}
          aria-current={
            currentActive === contactItem.label ? "page" : undefined
          }
          className="inline-flex items-center gap-1.5 rounded-full bg-[#c4f042] px-4 py-1.5 xl:px-5 xl:py-2 text-xs xl:text-sm font-bold text-zinc-950 transition-all duration-200 hover:bg-[#b2e232] hover:scale-105 active:scale-95 shadow-md shadow-[#c4f042]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4f042] shrink-0"
        >
          <span>{contactItem.label}</span>
          <span aria-hidden="true" className="text-xs">↗</span>
        </Link>
      </div>
    </>
  );
}

function DesktopNavLinksResolved({
  primaryItems,
  contactItem,
  active,
}: {
  primaryItems: readonly NavItem[];
  contactItem: NavItem;
  active?: string;
}) {
  const pathname = usePathname();
  const currentActive = active ?? resolveActiveFromPath(pathname);

  return (
    <DesktopNavLinks
      primaryItems={primaryItems}
      contactItem={contactItem}
      currentActive={currentActive}
    />
  );
}

function MobileNavLinks({
  primaryItems,
  contactItem,
  currentActive,
  onSelect,
}: {
  primaryItems: readonly NavItem[];
  contactItem: NavItem;
  currentActive?: string;
  onSelect: () => void;
}) {
  return (
    <div
      id="mobile-nav-menu"
      className="nav-blur mt-3 rounded-3xl border border-white/10 bg-[#07080c]/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden"
    >
      <div className="flex flex-col gap-1.5">
        {primaryItems.map((item) => {
          const isActive = currentActive === item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={onSelect}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
                isActive
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-3 border-t border-white/[0.08] pt-3">
        <Link
          href={contactItem.href}
          prefetch={true}
          onClick={onSelect}
          aria-current={
            currentActive === contactItem.label ? "page" : undefined
          }
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c4f042] px-5 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-[#b2e232]"
        >
          <span>{contactItem.label}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}

function MobileNavLinksResolved({
  primaryItems,
  contactItem,
  active,
  onSelect,
}: {
  primaryItems: readonly NavItem[];
  contactItem: NavItem;
  active?: string;
  onSelect: () => void;
}) {
  const pathname = usePathname();
  const currentActive = active ?? resolveActiveFromPath(pathname);

  return (
    <MobileNavLinks
      primaryItems={primaryItems}
      contactItem={contactItem}
      currentActive={currentActive}
      onSelect={onSelect}
    />
  );
}

export function SiteNavbar({
  items,
  brandName = "SHABNUM HUMA.",
  active,
}: {
  items: readonly NavItem[];
  brandName?: string;
  active?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const primaryItems = items.filter((item) => item.href !== "/contact");
  const contactItem = items.find((item) => item.href === "/contact") ?? {
    label: "Contact",
    href: "/contact",
  };
  const brandPrefix = brandName.replace(/\.$/, "");
  const hasTrailingDot = brandName.endsWith(".");

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3.5 pb-2 sm:px-6 lg:px-8">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-[#c4f042] focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-zinc-950 focus:outline-2 focus:outline-[#c4f042]"
      >
        Skip to content
      </a>

      <Suspense fallback={null}>
        <PathnameWatcher onNavigate={closeMenu} />
      </Suspense>

      <div ref={containerRef} className="mx-auto max-w-6xl">
        <nav
          aria-label="Main navigation"
          className="nav-blur flex items-center justify-between gap-3 sm:gap-4 rounded-full px-4 py-2.5 sm:px-6 sm:py-3 border border-white/10 bg-[#07080c]/85 shadow-2xl backdrop-blur-xl"
        >
          {/* Brand - Modern, bold, with vibrant monogram */}
          <Link
            href="/"
            onClick={closeMenu}
            className="group flex items-center gap-2.5 text-sm sm:text-base font-extrabold tracking-tight text-white transition-opacity hover:opacity-90 shrink-0"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c4f042] text-xs font-black text-zinc-950 transition-transform duration-200 group-hover:scale-105 shadow-sm">
              S
            </span>
            <span className="tracking-tight">
              {brandPrefix}
              {hasTrailingDot ? <span className="text-[#c4f042]">.</span> : null}
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <Suspense
            fallback={
              <DesktopNavLinks
                primaryItems={primaryItems}
                contactItem={contactItem}
                currentActive={active}
              />
            }
          >
            <DesktopNavLinksResolved
              primaryItems={primaryItems}
              contactItem={contactItem}
              active={active}
            />
          </Suspense>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav-menu"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white md:hidden"
          >
            {open ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </nav>

        {open ? (
          <Suspense
            fallback={
              <MobileNavLinks
                primaryItems={primaryItems}
                contactItem={contactItem}
                currentActive={active}
                onSelect={closeMenu}
              />
            }
          >
            <MobileNavLinksResolved
              primaryItems={primaryItems}
              contactItem={contactItem}
              active={active}
              onSelect={closeMenu}
            />
          </Suspense>
        ) : null}
      </div>
    </header>
  );
}
