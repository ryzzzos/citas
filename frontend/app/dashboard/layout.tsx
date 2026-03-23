"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { getDashboardTitle } from "@/components/layout/dashboardNavigation";

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.18),transparent_38%),radial-gradient(circle_at_92%_8%,rgba(14,165,233,0.12),transparent_34%),linear-gradient(180deg,#030712_0%,#09090b_100%)] text-zinc-100">
      <a
        href="#dashboard-main"
        className="sr-only z-[70] rounded-md bg-zinc-900 px-3 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-emerald-300"
      >
        Saltar al contenido principal
      </a>

      <DashboardSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="relative lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-zinc-800/90 bg-zinc-950/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 text-zinc-200 transition hover:border-zinc-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 lg:hidden"
              aria-label="Abrir menu lateral"
              aria-controls="dashboard-mobile-menu"
              aria-expanded={mobileOpen}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ≡
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Panel SaaS</p>
              <h1 className="truncate text-base font-semibold text-zinc-100 sm:text-lg">{pageTitle}</h1>
            </div>

            <label className="hidden min-w-52 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-400 md:flex">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Buscar modulo"
                className="w-full border-none bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
              />
            </label>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/agenda"
                className="hidden min-h-10 items-center rounded-xl border border-zinc-700 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-zinc-500 hover:text-white sm:inline-flex"
              >
                Agenda
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex min-h-10 items-center rounded-xl bg-emerald-500 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
              >
                Explorar
              </Link>
            </div>
          </div>
        </header>

        <main id="dashboard-main" className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
