"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Compass, Menu, Search } from "lucide-react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { getDashboardTitle } from "@/components/layout/dashboardNavigation";
import AppIcon from "@/components/ui/AppIcon";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import NavbarNotifications from "@/components/layout/NavbarNotifications";
import { BranchProvider } from "@/contexts/BranchContext";

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
    <BranchProvider>
      <div className="bg-[var(--surface-1)] h-dvh overflow-hidden [color:var(--text-primary)]">
      <a
        href="#dashboard-main"
        className="sr-only z-[70] rounded-md bg-[var(--surface-0)] px-3 py-2 text-sm shadow-[var(--shadow-sm)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
      >
        Saltar al contenido principal
      </a>

      <DashboardSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="relative flex h-full flex-col lg:pl-72">
        <div className="flex h-full flex-col p-2 sm:p-3 lg:p-4">

          
          <div className="bg-[var(--surface-2)]  border border-[var(--border-strong)] shadow-[var(--shadow-md)] rounded-[var(--radius-xl)] relative flex h-full min-h-0 flex-col overflow-hidden">
            <header className="sticky top-0 z-[49] border-b border-[var(--border-soft)] bg-[var(--surface-3)] backdrop-blur-2xl">
              <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-1)] lg:hidden"
                  aria-label="Abrir menu lateral"
                  aria-controls="dashboard-mobile-menu"
                  aria-expanded={mobileOpen}
                >
                  <AppIcon icon={Menu} size="md" />
                </button>

                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">{pageTitle}</h1>
                </div>

                <label className="hidden min-w-52 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-sm shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all focus-within:border-[var(--app-primary)] focus-within:bg-[var(--surface-3)] focus-within:ring-4 focus-within:ring-[var(--app-primary)] md:flex dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)] dark:focus-within:border-[var(--app-primary)] dark:focus-within:bg-[var(--surface-1)] dark:focus-within:ring-[var(--app-primary)]">
                  <AppIcon icon={Search} className="text-[var(--text-muted)]" />
                  <input
                    type="search"
                    placeholder="Buscar módulo..."
                    className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none  dark:placeholder:text-[var(--text-muted)]"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <NavbarNotifications />
                  <AnimatedThemeToggler
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
                    aria-label="Cambiar tema"
                  />
                  <Link
                    href="/dashboard/agenda"
                    className="hidden min-h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold tracking-tight text-[var(--text-secondary)]  hover:bg-[var(--surface-2)]/80  dark:hover:bg-[var(--surface-2)] sm:inline-flex"
                  >
                    <AppIcon icon={CalendarDays} size="xs" />
                    Agenda
                  </Link>
                </div>
              </div>
            </header>

            <main
              id="dashboard-main"
              className="mx-auto min-h-0 w-full max-w-[1500px] flex-1 overflow-y-auto px-3 py-4 sm:px-5 lg:px-6 lg:py-5 scrollbar-thin"
            >
              {children}
            </main>
          </div>
        </div>
      </div>
      </div>
    </BranchProvider>
  );
}
