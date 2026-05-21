import Button from "@/components/ui/Button";
import { BriefcaseBusiness, CircleCheckBig, CircleOff, Plus, Tags } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import type { Service } from "@/types";

interface ServicesHeaderProps {
  services: Service[];
  onCreate: () => void;
  onManageCategories: () => void;
}

export default function ServicesHeader({ services, onCreate, onManageCategories }: ServicesHeaderProps) {
  const activeCount = services.filter((service) => service.is_active).length;
  const inactiveCount = services.length - activeCount;

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">Mis servicios</h2>
          <p className="mt-1.5 max-w-2xl text-[14px] font-medium leading-relaxed text-[var(--text-secondary)]">
            Gestiona tu catálogo de servicios, precios y disponibilidad.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="secondary" 
            onClick={onManageCategories} 
            className="flex-1 sm:flex-none relative min-h-11 rounded-full px-5 shadow-[var(--shadow-sm)] transition-all active:scale-[0.98] border border-[var(--border-strong)] bg-[var(--surface-3)] hover:bg-[var(--surface-2)]"
          >
            <AppIcon icon={Tags} className="mr-2 text-[var(--text-secondary)]" size="sm" />
            <span className="font-semibold text-[13px] tracking-tight text-[var(--text-primary)]">Categorías</span>
          </Button>

          <Button 
            onClick={onCreate} 
            className="flex-1 sm:flex-none relative min-h-11 rounded-full px-5 shadow-[var(--shadow-md)] transition-all hover:brightness-110 active:scale-[0.98] bg-[linear-gradient(180deg,var(--app-primary),var(--app-primary-strong))] text-[var(--surface-3)] border border-[var(--border-soft)]"
          >
            <AppIcon icon={Plus} className="mr-2" size="sm" />
            <span className="font-semibold text-[13px] tracking-tight">Nuevo</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
        <article className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-secondary)]">
              <AppIcon icon={BriefcaseBusiness} size="sm" />
            </div>
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">Total de servicios</p>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)]">{services.length}</p>
        </article>

        <article className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]">
           <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-info)] text-[var(--surface-3)]">
              <AppIcon icon={CircleCheckBig} size="sm" />
            </div>
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">Activos</p>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)]">{activeCount}</p>
        </article>

        <article className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]">
           <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-pending)] text-[var(--surface-3)]">
              <AppIcon icon={CircleOff} size="sm" />
            </div>
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">Inactivos</p>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)]">{inactiveCount}</p>
        </article>
      </div>
    </header>
  );
}
