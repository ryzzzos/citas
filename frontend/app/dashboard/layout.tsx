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
    <div className="bg-[var(--surface-1)] h-dvh overflow-hidden [color:var(--text-primary)]">
      <a
        href="#dashboard-main"
        className="sr-only z-[70] rounded-md bg-[var(--surface-0)] px-3 py-2 text-sm shadow-[var(--shadow-[var(--shadow-sm)])] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary-strong)]"
      >
        Saltar al contenido principal
      </a>

      <DashboardSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="relative flex h-full flex-col lg:pl-72">
        <div className="flex h-full flex-col p-2 sm:p-3 lg:p-4">

          
          <div className="bg-[var(--surface-2)]  border border-[var(--border-strong)] shadow-[var(--shadow-md)] rounded-[var(--radius-xl)] relative flex h-full min-h-0 flex-col overflow-hidden">
            <header className="sticky top-0 z-20 border-b border-zinc-200/50 bg-[var(--surface-3)]/ backdrop-blur-2xl dark:border-zinc-800/50 ">
              <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100/50 text-zinc-600 transition-colors hover:bg-zinc-200/50 dark:bg-zinc-800/50  dark:hover:bg-zinc-700/50 lg:hidden"
                  aria-label="Abrir menu lateral"
                  aria-controls="dashboard-mobile-menu"
                  aria-expanded={mobileOpen}
                >
                  <AppIcon icon={Menu} size="md" />
                </button>

                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-base font-bold tracking-tight text-slate-900  sm:text-lg">{pageTitle}</h1>
                </div>

                <label className="hidden min-w-52 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-sm shadow-[var(--shadow-[var(--shadow-sm)])] backdrop-blur-sm transition-all focus-within:border-[var(--app-primary)] focus-within:bg-white focus-within:ring-4 focus-within:ring-[var(--app-primary-soft)] md:flex dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)] dark:focus-within:border-[var(--app-primary)] dark:focus-within:bg-zinc-900 dark:focus-within:ring-[rgba(37,99,235,0.15)]">
                  <AppIcon icon={Search} className="text-zinc-400" />
                  <input
                    type="search"
                    placeholder="Buscar módulo..."
                    className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none  dark:placeholder:text-[var(--text-muted)]"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <AnimatedThemeToggler
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100/50 text-zinc-600 transition-colors hover:bg-zinc-200/50 dark:bg-zinc-800/50  dark:hover:bg-zinc-700/50"
                    aria-label="Cambiar tema"
                  />
                  <Link
                    href="/dashboard/agenda"
                    className="hidden min-h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold tracking-tight text-zinc-600 transition-colors hover:bg-[var(--surface-2)]/80  dark:hover:bg-[var(--surface-2)] sm:inline-flex"
                  >
                    <AppIcon icon={CalendarDays} size="xs" />
                    Agenda
                  </Link>
                  <Link
                    href="/sucursales"
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--app-primary-gradient)] px-5 text-[13px] font-semibold tracking-tight text-white shadow-[0_4px_14px_-6px_rgba(37,99,235,0.4),inset_0_1px_rgba(255,255,255,0.25)] transition-all hover:brightness-110 active:scale-[0.98] border border-t-[rgba(255,255,255,0.1)] border-b-[rgba(0,0,0,0.1)] border-x-transparent"
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
