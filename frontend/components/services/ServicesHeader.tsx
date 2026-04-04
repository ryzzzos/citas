import Button from "@/components/ui/Button";
import { BriefcaseBusiness, CircleCheckBig, CircleOff, Plus } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import type { Service } from "@/types";

interface ServicesHeaderProps {
  services: Service[];
  onCreate: () => void;
}

export default function ServicesHeader({ services, onCreate }: ServicesHeaderProps) {
  const activeCount = services.filter((service) => service.is_active).length;
  const inactiveCount = services.length - activeCount;

  return (
    <header className="dashboard-surface-1 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="dashboard-text-muted text-[11px] font-semibold uppercase tracking-[0.2em]">
            Gestion de servicios
          </p>
          <h2 className="dashboard-title mt-2 text-2xl font-semibold">Mis servicios</h2>
          <p className="dashboard-text-secondary mt-2 max-w-2xl text-sm">
            Crea, edita y controla la disponibilidad de los servicios de tu negocio.
          </p>
        </div>

        <Button onClick={onCreate} className="min-h-11 rounded-[var(--dashboard-radius-md)] px-4">
          <AppIcon icon={Plus} className="mr-2" />
          Nuevo servicio
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="dashboard-surface-2 p-3">
          <AppIcon icon={BriefcaseBusiness} className="dashboard-text-muted" />
          <p className="dashboard-text-muted text-xs">Total</p>
          <p className="dashboard-title mt-1 text-2xl font-semibold">{services.length}</p>
        </article>
        <article className="dashboard-surface-2 p-3">
          <AppIcon icon={CircleCheckBig} className="text-teal-700 dark:text-teal-300" />
          <p className="dashboard-text-muted text-xs">Activos</p>
          <p className="mt-1 text-2xl font-semibold text-teal-700 dark:text-teal-300">{activeCount}</p>
        </article>
        <article className="dashboard-surface-2 p-3">
          <AppIcon icon={CircleOff} className="text-amber-700 dark:text-amber-300" />
          <p className="dashboard-text-muted text-xs">Inactivos</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700 dark:text-amber-300">{inactiveCount}</p>
        </article>
      </div>
    </header>
  );
}
