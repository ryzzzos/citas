import type { AgendaView } from "@/lib/agenda/types";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";

interface AgendaHeaderProps {
  title: string;
  timezone: string;
  view: AgendaView;
  onViewChange: (view: AgendaView) => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const VIEW_OPTIONS: Array<{ value: AgendaView; label: string; disabled?: boolean }> = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mensual", disabled: true },
];

export default function AgendaHeader({
  title,
  timezone,
  view,
  onViewChange,
  onToday,
  onPrevious,
  onNext,
}: AgendaHeaderProps) {
  return (
    <header className="rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-md)] backdrop-blur-2xl dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[var(--shadow-md)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--app-primary)] dark:text-blue-400">Agenda operativa</p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl ">{title}</h2>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)]">
            <AppIcon icon={Clock3} size="xs" />
            Zona horaria canónica: {timezone}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex min-h-11 items-center gap-1 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-1.5 shadow-[var(--shadow-[var(--shadow-sm)])] backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
            <button
              type="button"
              onClick={onPrevious}
              className="inline-flex min-h-9 items-center gap-1 rounded-xl px-3 text-[13px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-white hover:shadow-[var(--shadow-sm)]  dark:hover:bg-[var(--surface-2)]"
              aria-label="Periodo anterior"
            >
              <AppIcon icon={ChevronLeft} />
              Anterior
            </button>
            <button
              type="button"
              onClick={onToday}
              className="min-h-9 rounded-xl bg-white px-4 text-[13px] font-bold tracking-tight text-[var(--text-primary)] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),inset_0_1px_rgba(255,255,255,0.5)] transition-all hover:bg-[var(--surface-2)] active:scale-[0.98] border border-[var(--border-strong)] dark:bg-zinc-800  dark:border-zinc-700/50 dark:hover:bg-zinc-700 dark:shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex min-h-9 items-center gap-1 rounded-xl px-3 text-[13px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-white hover:shadow-[var(--shadow-sm)]  dark:hover:bg-[var(--surface-2)]"
              aria-label="Periodo siguiente"
            >
              Siguiente
              <AppIcon icon={ChevronRight} />
            </button>
          </div>

          <div role="tablist" aria-label="Selector de vista" className="inline-flex min-h-11 items-center gap-1 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-1.5 shadow-[var(--shadow-[var(--shadow-sm)])] backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
            {VIEW_OPTIONS.map((option) => {
              const active = option.value === view;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-disabled={option.disabled}
                  disabled={option.disabled}
                  onClick={() => onViewChange(option.value)}
                  className={`min-h-9 rounded-xl px-4 text-[13px] font-semibold transition-all ${
                    active
                      ? "bg-[var(--app-primary-gradient)] text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.4),inset_0_1px_rgba(255,255,255,0.25)] border border-t-[rgba(255,255,255,0.1)] border-b-[rgba(0,0,0,0.2)] border-x-transparent"
                      : "text-[var(--text-secondary)] hover:bg-white hover:shadow-[var(--shadow-sm)] disabled:cursor-not-allowed disabled:opacity-40  dark:hover:bg-[var(--surface-2)] dark:hover:text-zinc-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
