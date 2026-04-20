"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Compass, Menu, Search } from "lucide-react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { getDashboardTitle } from "@/components/layout/dashboardNavigation";
import AppIcon from "@/components/ui/AppIcon";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const pageTitle = getDashboardTitle(pathname);

  return (
    <div className="dashboard-app-bg h-dvh overflow-hidden [color:var(--dashboard-text-primary)]">
      <a
        href="#dashboard-main"
        className="sr-only z-[70] rounded-md bg-[var(--dashboard-surface-1)] px-3 py-2 text-sm shadow-[var(--dashboard-shadow-sm)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-border-focus)]"
      >
        Saltar al contenido principal
      </a>

      <DashboardSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="relative flex h-full flex-col lg:pl-72">
        <div className="flex h-full flex-col p-2 sm:p-3 lg:p-4">
          <div className="dashboard-main-shell relative flex h-full min-h-0 flex-col overflow-hidden">
            <header className="sticky top-0 z-20 border-b border-[color:var(--dashboard-border-subtle)] bg-[color:color-mix(in_oklab,var(--dashboard-surface-1)_88%,transparent)] backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="dashboard-surface-2 dashboard-interactive dashboard-focusable inline-flex h-11 w-11 items-center justify-center lg:hidden"
                  aria-label="Abrir menu lateral"
                  aria-controls="dashboard-mobile-menu"
                  aria-expanded={mobileOpen}
                >
                  <AppIcon icon={Menu} size="md" />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="dashboard-text-muted text-[11px] font-semibold uppercase tracking-[0.2em]">Panel SaaS</p>
                  <h1 className="dashboard-title truncate text-base font-semibold sm:text-lg">{pageTitle}</h1>
                </div>

                <label className="dashboard-surface-2 hidden min-w-52 items-center gap-2 px-3 py-2 text-sm md:flex">
                  <AppIcon icon={Search} className="dashboard-text-muted" />
                  <input
                    type="search"
                    placeholder="Buscar modulo"
                    className="dashboard-focusable w-full border-none bg-transparent text-sm [color:var(--dashboard-text-secondary)] placeholder:[color:var(--dashboard-text-muted)] focus:outline-none"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <AnimatedThemeToggler
                    className="dashboard-surface-2 dashboard-interactive dashboard-focusable inline-flex h-10 w-10 items-center justify-center"
                    aria-label="Cambiar tema"
                  />
                  <Link
                    href="/dashboard/agenda"
                    className="dashboard-surface-2 dashboard-interactive dashboard-focusable hidden min-h-10 items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide [color:var(--dashboard-text-secondary)] sm:inline-flex"
                  >
                    <AppIcon icon={CalendarDays} size="xs" />
                    Agenda
                  </Link>
                  <Link
                    href="/sucursales"
                    className="dashboard-interactive dashboard-focusable inline-flex min-h-10 items-center gap-2 rounded-[var(--dashboard-radius-md)] border border-teal-300/70 bg-teal-500 px-3 text-xs font-semibold uppercase tracking-wide text-slate-950 hover:bg-teal-400"
                  >
                    <AppIcon icon={Compass} size="xs" />
                    Explorar
                  </Link>
                </div>
              </div>
            </header>

            <main
              id="dashboard-main"
              className="mx-auto min-h-0 w-full max-w-[1500px] flex-1 overflow-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-7"
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
