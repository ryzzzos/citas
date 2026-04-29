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
    <header className="rounded-3xl border border-white/50 bg-white/60 p-6 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--app-primary)] dark:text-blue-400">
            Gestión de servicios
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Mis servicios</h2>
          <p className="mt-1.5 max-w-2xl text-[14px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Crea, edita y controla la disponibilidad de los servicios de tu negocio.
          </p>
        </div>

        <Button onClick={onCreate} className="min-h-11">
          <AppIcon icon={Plus} className="mr-2" />
          Nuevo servicio
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50">
          <AppIcon icon={BriefcaseBusiness} className="text-slate-400" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Total</p>
          <p className="mt-1 text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">{services.length}</p>
        </article>
        <article className="rounded-2xl border border-blue-200/60 bg-blue-500/10 p-4 shadow-[inset_0_1px_rgba(255,255,255,0.4)] backdrop-blur-sm dark:border-blue-500/30 dark:bg-blue-500/10">
          <AppIcon icon={CircleCheckBig} className="text-[var(--app-primary)] dark:text-blue-400" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-primary)] dark:text-blue-400">Activos</p>
          <p className="mt-1 text-[28px] font-bold tracking-tight text-blue-900 dark:text-blue-100">{activeCount}</p>
        </article>
        <article className="rounded-2xl border border-amber-200/60 bg-amber-500/10 p-4 shadow-[inset_0_1px_rgba(255,255,255,0.4)] backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <AppIcon icon={CircleOff} className="text-amber-500" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Inactivos</p>
          <p className="mt-1 text-[28px] font-bold tracking-tight text-amber-900 dark:text-amber-100">{inactiveCount}</p>
        </article>
      </div>
    </header>
  );
}
