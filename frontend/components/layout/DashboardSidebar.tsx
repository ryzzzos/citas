"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import {
  DASHBOARD_NAV_GROUPS,
  type DashboardNavGroup,
  type DashboardNavItem,
  isItemActive,
} from "@/components/layout/dashboardNavigation";
import AppIcon from "@/components/ui/AppIcon";

interface DashboardSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function BadgeMark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 rounded-full transition-all duration-300 ${
        active 
          ? "bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-primary)] scale-110" 
          : "bg-slate-300 dark:bg-slate-700"
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
      <h2 className="dashboard-text-muted px-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
        {group.label}
      </h2>
      <ul className="mt-2 space-y-1.5">
        {group.items.map((item: DashboardNavItem) => {
          const active = isItemActive(pathname, item);
          const ItemIcon = item.icon;

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={onItemSelect}
                aria-current={active ? "page" : undefined}
                className={`dashboard-interactive dashboard-focusable group flex min-h-12 items-center justify-between gap-3 rounded-[1rem] border px-3 py-2.5 transition-all duration-300 ${
                  active
                    ? "border-[rgba(255,255,255,0.4)] bg-[var(--glass-surface-1-bg)] text-[var(--app-primary-strong)] shadow-[0_8px_24px_-8px_rgba(37,99,235,0.15)] backdrop-blur-xl dark:border-[rgba(255,255,255,0.06)] dark:text-[var(--app-primary-soft)]"
                    : "border-transparent text-slate-500 hover:bg-slate-100/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                }`}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <AppIcon icon={ItemIcon} className={`mt-0.5 shrink-0 transition-transform duration-300 ${active ? "scale-110" : ""}`} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.label}</span>
                    {item.hint ? (
                      <span className="dashboard-text-muted block truncate text-xs group-hover:[color:var(--dashboard-text-secondary)]">
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
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
      <div className="mb-2 px-1">
        <div className="rounded-[1.25rem] border border-white/50 bg-white/40 p-4 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--app-primary)] dark:text-blue-400">
            Agenda Web
          </p>
          <p className="mt-1.5 text-[19px] font-bold tracking-tight text-slate-900 dark:text-white">
            Control Center
          </p>
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Gestión integral de reservas y operación diaria.
          </p>
        </div>
      </div>

      <nav className="mt-6 space-y-6 px-1" aria-label="Navegacion del dashboard">
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-[color:var(--dashboard-border-subtle)] bg-[color:color-mix(in_oklab,var(--dashboard-surface-base)_86%,transparent)] px-4 py-5 backdrop-blur-xl lg:block">
        <SidebarContent pathname={pathname} onItemSelect={() => undefined} />
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-slate-950/45 transition duration-200 motion-reduce:transition-none ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          aria-label="Cerrar menu lateral"
        />

        <aside
          id="dashboard-mobile-menu"
          className={`absolute inset-y-0 left-0 w-[86vw] max-w-80 border-r border-[color:var(--dashboard-border-subtle)] bg-[color:var(--dashboard-surface-base)] px-4 py-5 shadow-[var(--dashboard-shadow-lg)] transition-transform duration-200 motion-reduce:transition-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={onCloseMobile}
            className="dashboard-surface-2 dashboard-interactive dashboard-focusable absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center"
            aria-label="Cerrar menu lateral"
          >
            <AppIcon icon={X} />
          </button>
          <SidebarContent pathname={pathname} onItemSelect={onCloseMobile} />
        </aside>
      </div>
    </>
  );
}
