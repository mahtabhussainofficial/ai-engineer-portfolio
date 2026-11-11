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
      <div className="hidden items-center gap-1.5 md:flex">
        {primaryItems.map((item) => {
          const isActive = currentActive === item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isActive
                  ? "border border-[#2f4059] bg-[#172130] font-medium text-[#f1f5f9]"
                  : "border border-transparent text-[#a1acba] hover:bg-[#111823] hover:text-[#f1f5f9]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="hidden items-center md:flex">
        <Link
          href={contactItem.href}
          aria-current={
            currentActive === contactItem.label ? "page" : undefined
          }
          className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
            currentActive === contactItem.label
              ? "border-[#60a5fa] bg-[#172130] text-[#f1f5f9]"
              : "border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover"
          }`}
        >
          <span>{contactItem.label}</span>
          <span aria-hidden="true" className="text-xs">
            ↗
          </span>
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
      className="nav-glass mt-2 rounded-2xl p-3 md:hidden"
    >
      <div className="flex flex-col gap-1">
        {primaryItems.map((item) => {
          const isActive = currentActive === item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onSelect}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2.5 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isActive
                  ? "border border-[#2f4059] bg-[#172130] font-medium text-[#f1f5f9]"
                  : "border border-transparent text-[#a1acba] hover:bg-[#111823] hover:text-[#f1f5f9]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-2.5 border-t border-[#1e293b] pt-2.5">
        <Link
          href={contactItem.href}
          onClick={onSelect}
          aria-current={
            currentActive === contactItem.label ? "page" : undefined
          }
          className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            currentActive === contactItem.label
              ? "border-[#60a5fa] bg-[#172130] text-[#f1f5f9]"
              : "border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover"
          }`}
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
  brandName = "SHABNUM H.",
  active,
}: {
  items: readonly NavItem[];
  brandName?: string;
  active?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => {
      const next = window.scrollY > 12;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <header className="sticky top-0 z-50 w-full px-4 pt-3 pb-2 sm:px-6 lg:px-8">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-accent"
      >
        Skip to content
      </a>

      <Suspense fallback={null}>
        <PathnameWatcher onNavigate={closeMenu} />
      </Suspense>

      <div ref={containerRef} className="mx-auto max-w-7xl">
        <nav
          aria-label="Main navigation"
          className={`nav-glass flex items-center justify-between gap-6 rounded-2xl px-4 py-2.5 transition-colors duration-200 sm:px-6 ${
            scrolled ? "border-[#2f3f57] bg-[#0b0f16]/94" : ""
          }`}
        >
          <Link
            href="/"
            onClick={closeMenu}
            className="shrink-0 font-mono text-sm font-semibold tracking-[0.14em] text-[#f1f5f9] transition-colors duration-200 hover:text-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]"
          >
            {brandPrefix}
            {hasTrailingDot ? <span className="text-[#60a5fa]">.</span> : null}
          </Link>

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

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav-menu"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#233044] bg-[#111823] text-[#f1f5f9] transition-colors duration-200 hover:border-[#3b82f6]/60 hover:text-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60a5fa] md:hidden"
          >
            {open ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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
                strokeWidth="1.8"
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
