"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut, ChevronDown, MapPin } from "lucide-react";
import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";

import {
  DASHBOARD_NAV_GROUPS,
  type DashboardNavGroup,
  type DashboardNavItem,
  isItemActive,
} from "@/components/layout/dashboardNavigation";
import AppIcon from "@/components/ui/AppIcon";
import BrandLogo from "@/components/ui/BrandLogo";
import { logout } from "@/lib/api/auth";
import { useBranchContext } from "@/contexts/BranchContext";

interface DashboardSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navLinkVariants = cva(
  "group relative flex min-h-12 items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 py-2.5 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:ring-offset-2",
  {
    variants: {
      active: {
        true: "text-[var(--app-primary)]",
        false: "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
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
      className={`relative z-10 h-2 w-2 rounded-full transition-all duration-300 ${
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
  layoutIdPrefix,
}: {
  group: DashboardNavGroup;
  pathname: string;
  onItemSelect: (href: string) => void;
  layoutIdPrefix: string;
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
                onClick={() => onItemSelect(item.href)}
                aria-current={active ? "page" : undefined}
                className={navLinkVariants({ active })}
              >
                {active && (
                  <motion.div
                    layoutId={`${layoutIdPrefix}-active-indicator`}
                    className="absolute inset-0 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-md)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex min-w-0 items-center gap-3">
                  <AppIcon 
                    icon={ItemIcon} 
                    size="md"
                    className={`shrink-0 transition-transform duration-300 ${active ? "scale-110" : ""}`} 
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

function SidebarContent({ pathname, onItemSelect, layoutIdPrefix }: { pathname: string; onItemSelect: (href: string) => void; layoutIdPrefix: string; }) {
  const { branches, activeBranch, setActiveBranch, isLoading, business } = useBranchContext();
  const [sedesExpanded, setSedesExpanded] = useState(true);
  const [isFullyOpen, setIsFullyOpen] = useState(true);

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border-strong)] pb-4 pr-1">
        <div className="px-3 mb-6 shrink-0">
          <Link
            href="/"
            className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:ring-offset-2"
            aria-label="Ir a la página de inicio"
          >
            <BrandLogo variant="full" />
          </Link>
        </div>

        <nav className="space-y-6 px-1" aria-label="Navegacion del dashboard">
          {/* Dynamic Collapsible Sedes Group */}
          <section aria-label="Sedes" className="relative z-10">
            <button
              type="button"
              onClick={() => {
                if (sedesExpanded) {
                  setIsFullyOpen(false);
                  setSedesExpanded(false);
                } else {
                  setSedesExpanded(true);
                }
              }}
              className="w-full flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none cursor-pointer"
            >
              <span>Sedes</span>
              <ChevronDown
                className="h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200"
                style={{ transform: sedesExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
              />
            </button>

            <AnimatePresence initial={false}>
              {sedesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  onAnimationComplete={() => {
                    if (sedesExpanded) {
                      setIsFullyOpen(true);
                    }
                  }}
                  className={isFullyOpen ? "overflow-visible" : "overflow-hidden"}
                >
                  <ul className="mt-2 space-y-1.5 pb-2 px-1 -mx-1">
                    {isLoading || !business ? (
                      <div className="space-y-1.5 pt-1">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-12 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-3)]" />
                        ))}
                      </div>
                    ) : (
                      branches.map((branch) => {
                        const active = branch.id === activeBranch?.id;
                        return (
                          <li key={branch.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveBranch(branch.id);
                                onItemSelect(pathname); // close mobile drawer if clicked
                              }}
                              className={`${navLinkVariants({ active })} w-full text-left relative cursor-pointer`}
                            >
                              {active && (
                                <motion.div
                                  layoutId={`${layoutIdPrefix}-sede-active-indicator`}
                                  className="absolute inset-0 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-md)]"
                                  initial={false}
                                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10 flex min-w-0 items-center gap-3">
                                <AppIcon 
                                  icon={MapPin} 
                                  size="md"
                                  className={`shrink-0 transition-transform duration-300 ${active ? "scale-110 text-[var(--app-primary)]" : "text-[var(--text-muted)]"}`} 
                                />
                                <span className="min-w-0">
                                      <span className="block truncate text-sm font-semibold">{branch.name}</span>
                                </span>
                              </span>
                              <BadgeMark active={active} />
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {DASHBOARD_NAV_GROUPS.map((group) => (
            <SidebarGroup
              key={group.id}
              group={group}
              pathname={pathname}
              onItemSelect={onItemSelect}
              layoutIdPrefix={layoutIdPrefix}
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto shrink-0 border-t border-[var(--border-strong)] pt-4 px-1 pb-1">
        <button
          type="button"
          onClick={handleLogout}
          className="group relative flex min-h-12 w-full items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[var(--text-secondary)] transition-colors duration-300 hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)] focus-visible:ring-offset-2"
        >
          <span className="relative z-10 flex min-w-0 items-center gap-3">
            <AppIcon icon={LogOut} size="md" className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">Cerrar sesión</span>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardSidebar({
  mobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);

  // Mantener sincronizado si la ruta cambia por retroceder en el navegador, etc.
  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-5 lg:block">
        <SidebarContent pathname={activePath} onItemSelect={(href) => setActivePath(href)} layoutIdPrefix="desktop" />
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-[var(--surface-0)]/45 transition duration-200 motion-reduce:transition-none ${mobileOpen ? "opacity-100" : "opacity-0"}`}
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
          <SidebarContent 
            pathname={activePath} 
            onItemSelect={(href) => {
              setActivePath(href);
              onCloseMobile();
            }} 
            layoutIdPrefix="mobile" 
          />
        </aside>
      </div>
    </>
  );
}
