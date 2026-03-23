"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DASHBOARD_NAV_GROUPS,
  type DashboardNavGroup,
  type DashboardNavItem,
  isItemActive,
} from "@/components/layout/dashboardNavigation";

interface DashboardSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function BadgeMark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 rounded-full transition ${
        active ? "bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]" : "bg-zinc-600"
      }`}
    />
  );
}

function SidebarGroup({
  group,
  pathname,
  onItemSelect,
}: {
  group: DashboardNavGroup;
  pathname: string;
  onItemSelect: () => void;
}) {
  return (
    <section aria-label={group.label}>
      <h2 className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {group.label}
      </h2>
      <ul className="mt-2 space-y-1.5">
        {group.items.map((item: DashboardNavItem) => {
          const active = isItemActive(pathname, item);

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={onItemSelect}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 ${
                  active
                    ? "border-zinc-700 bg-zinc-800/95 text-zinc-100 shadow-[0_12px_30px_-24px_rgba(16,185,129,0.8)]"
                    : "border-transparent text-zinc-300 hover:border-zinc-700/70 hover:bg-zinc-800/60"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{item.label}</span>
                  {item.hint ? (
                    <span className="block truncate text-xs text-zinc-500 group-hover:text-zinc-400">
                      {item.hint}
                    </span>
                  ) : null}
                </span>
                <BadgeMark active={active} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SidebarContent({ pathname, onItemSelect }: { pathname: string; onItemSelect: () => void }) {
  return (
    <>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-[0_35px_60px_-45px_rgba(0,0,0,0.95)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Agenda Web</p>
        <p className="mt-2 text-lg font-semibold text-zinc-100">Control Center</p>
        <p className="mt-1 text-xs text-zinc-400">Gestion integral de reservas y operacion diaria.</p>
      </div>

      <nav className="mt-6 space-y-6" aria-label="Navegacion del dashboard">
        {DASHBOARD_NAV_GROUPS.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            pathname={pathname}
            onItemSelect={onItemSelect}
          />
        ))}
      </nav>
    </>
  );
}

export default function DashboardSidebar({
  mobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-zinc-800 bg-zinc-950/95 px-4 py-5 backdrop-blur lg:block">
        <SidebarContent pathname={pathname} onItemSelect={() => undefined} />
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-black/60 transition ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          aria-label="Cerrar menu lateral"
        />

        <aside
          id="dashboard-mobile-menu"
          className={`absolute inset-y-0 left-0 w-[86vw] max-w-80 border-r border-zinc-800 bg-zinc-950 px-4 py-5 shadow-2xl transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent pathname={pathname} onItemSelect={onCloseMobile} />
        </aside>
      </div>
    </>
  );
}
