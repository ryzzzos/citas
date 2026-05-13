"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cva } from "class-variance-authority";

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

const navLinkVariants = cva(
  "group flex min-h-12 items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:ring-offset-2",
  {
    variants: {
      active: {
        true: "bg-[var(--surface-3)] border-[var(--border-strong)] text-[var(--app-primary-strong)] shadow-[var(--shadow-md)] dark:text-[var(--app-primary)]",
        false: "border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] dark:hover:bg-[var(--surface-1)]",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

function BadgeMark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 rounded-full transition-all duration-300 ${
        active 
          ? "bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-primary)] scale-110" 
          : "bg-[var(--surface-0)] dark:bg-[var(--surface-3)]"
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
      <h2 className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
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
                className={navLinkVariants({ active })}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <AppIcon 
                    icon={ItemIcon} 
                    className={`mt-0.5 shrink-0 transition-transform duration-300 ${active ? "scale-110" : ""}`} 
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.label}</span>
                    {item.hint ? (
                      <span className="block truncate text-xs text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
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
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-[var(--shadow-sm)])]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--app-primary)]">
            Agenda Web
          </p>
          <p className="mt-1.5 text-[19px] font-bold tracking-tight text-[var(--text-primary)]">
            Control Center
          </p>
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-[var(--text-muted)]">
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-5 lg:block">
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
          className={`absolute inset-y-0 left-0 w-[86vw] max-w-80 border-r border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-5 shadow-[var(--shadow-lg)] transition-transform duration-200 motion-reduce:transition-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={onCloseMobile}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--surface-0)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]"
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