import Button from "@/components/ui/Button";
import { BriefcaseBusiness, CircleCheckBig, CircleOff, Plus } from "lucide-react";
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
    <header className="overflow-hidden rounded-[2rem] border border-[var(--border-strong)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.52)] backdrop-blur-2xl dark:border-[var(--border-strong)] dark:bg-[linear-gradient(180deg,#0b1220_0%,#060b14_100%)] dark:shadow-[0_40px_80px_-60px_rgba(15,23,42,0.58)] lg:p-8">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="relative z-10">
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)] lg:text-4xl">Mis servicios</h2>
          <p className="mt-2 max-w-2xl text-[14px] font-medium leading-relaxed text-[var(--text-secondary)]">
            Crea, edita y controla la disponibilidad de los servicios y precios de tu negocio en tiempo real.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onManageCategories} className="relative z-10 min-h-12 shrink-0 rounded-full px-6 shadow-[var(--shadow-sm)] transition-all hover:scale-[1.02] active:scale-[0.98]">
            <span className="font-bold tracking-tight">Categorías</span>
          </Button>

          <Button onClick={onCreate} className="relative z-10 min-h-12 shrink-0 rounded-full px-6 shadow-[0_4px_14px_-6px_rgba(37,99,235,0.4),inset_0_1px_rgba(255,255,255,0.25)] transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]">
            <AppIcon icon={Plus} className="mr-2" size="sm" />
            <span className="font-bold tracking-tight">Nuevo servicio</span>
          </Button>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
        <article className="group relative overflow-hidden rounded-[1.5rem] border border-[var(--border-strong)] bg-[var(--surface-3)]/ p-5 shadow-[var(--shadow-sm)] backdrop-blur-md transition-all hover:border-[var(--app-primary)]/80 hover:bg-[var(--surface-3)]/ hover:shadow-md dark:border-[var(--border-strong)]  dark:hover:border-[var(--app-primary)]/60 dark:hover:bg-black/40">
          <div className="flex items-center justify-between">
            <AppIcon icon={BriefcaseBusiness} className="text-[var(--text-muted)] transition-colors group-hover:text-[var(--app-primary)] dark:text-[var(--text-secondary)]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Total</p>
          </div>
          <p className="mt-4 text-4xl font-bold tracking-tight text-[var(--text-primary)]">{services.length}</p>
        </article>

        <article className="group relative overflow-hidden rounded-[1.5rem] border border-blue-200/60 bg-blue-50/50 p-5 shadow-[inset_0_1px_rgba(255,255,255,0.4)] backdrop-blur-md transition-all hover:bg-blue-100/50 hover:shadow-md dark:border-blue-900/30 dark:bg-blue-900/10 dark:hover:bg-blue-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl dark:bg-blue-500/10" />
          <div className="flex items-center justify-between">
            <AppIcon icon={CircleCheckBig} className="text-[var(--app-primary)] dark:text-blue-400" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--app-primary)] dark:text-blue-400">Activos</p>
          </div>
          <p className="mt-4 text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-50">{activeCount}</p>
        </article>

        <article className="group relative overflow-hidden rounded-[1.5rem] border border-amber-200/60 bg-amber-50/50 p-5 shadow-[inset_0_1px_rgba(255,255,255,0.4)] backdrop-blur-md transition-all hover:bg-amber-100/50 hover:shadow-md dark:border-amber-900/30 dark:bg-amber-900/10 dark:hover:bg-amber-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl dark:bg-amber-500/10" />
          <div className="flex items-center justify-between">
            <AppIcon icon={CircleOff} className="text-amber-500 dark:text-amber-400" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Inactivos</p>
          </div>
          <p className="mt-4 text-4xl font-bold tracking-tight text-amber-900 dark:text-amber-50">{inactiveCount}</p>
        </article>
      </div>
    </header>
  );
}
