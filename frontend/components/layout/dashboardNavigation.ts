import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, Building2, CalendarDays, Compass, LayoutDashboard } from "lucide-react";

export type DashboardMatchMode = "exact" | "prefix";

export interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  match: DashboardMatchMode;
  icon: LucideIcon;
  hint?: string;
}

export interface DashboardNavGroup {
  id: string;
  label: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        id: "overview",
        label: "Resumen",
        href: "/dashboard",
        match: "exact",
        icon: LayoutDashboard,
        hint: "Vista general del negocio",
      },
      {
        id: "agenda",
        label: "Agenda",
        href: "/dashboard/agenda",
        match: "prefix",
        icon: CalendarDays,
        hint: "Operacion diaria y semanal",
      },
      {
        id: "services",
        label: "Mis servicios",
        href: "/dashboard/services",
        match: "prefix",
        icon: BriefcaseBusiness,
        hint: "Catalogo interno y estados",
      },
      {
        id: "business-profile",
        label: "Perfil de negocio",
        href: "/dashboard/business-profile",
        match: "prefix",
        icon: Building2,
        hint: "Identidad publica y conversion",
      },
    ],
  },
  {
    id: "growth",
    label: "Plataforma",
    items: [
      {
        id: "sucursales",
        label: "Sucursales",
        href: "/sucursales",
        match: "prefix",
        icon: Compass,
        hint: "Descubrimiento publico por mapa",
      },
    ],
  },
];

export function isItemActive(pathname: string, item: DashboardNavItem): boolean {
  if (item.match === "exact") {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getDashboardTitle(pathname: string): string {
  for (const group of DASHBOARD_NAV_GROUPS) {
    for (const item of group.items) {
      if (isItemActive(pathname, item)) {
        return item.label;
      }
    }
  }

  return "Dashboard";
}
