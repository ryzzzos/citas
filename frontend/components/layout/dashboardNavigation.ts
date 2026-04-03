export type DashboardMatchMode = "exact" | "prefix";

export interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  match: DashboardMatchMode;
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
        hint: "Vista general del negocio",
      },
      {
        id: "agenda",
        label: "Agenda",
        href: "/dashboard/agenda",
        match: "prefix",
        hint: "Operacion diaria y semanal",
      },
      {
        id: "services",
        label: "Mis servicios",
        href: "/dashboard/services",
        match: "prefix",
        hint: "Catalogo interno y estados",
      },
    ],
  },
  {
    id: "growth",
    label: "Plataforma",
    items: [
      {
        id: "marketplace",
        label: "Marketplace",
        href: "/marketplace",
        match: "prefix",
        hint: "Visibilidad frente a clientes",
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
