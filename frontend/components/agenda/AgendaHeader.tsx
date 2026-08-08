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
    <header className="rounded-2xl sm:rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-3 sm:p-4 shadow-[var(--shadow-md)] backdrop-blur-2xl dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[var(--shadow-md)]">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--app-primary)]">Agenda operativa</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--text-primary)] sm:mt-1.5 sm:text-3xl">{title}</h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)] sm:mt-1.5 sm:text-[13px]">
            <AppIcon icon={Clock3} size="xs" />
            Zona horaria canónica: {timezone}
          </p>
        </div>

        {/* Side-by-Side Controls for Mobile & Desktop */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Navigation Controls (< Hoy >) */}
          <div className="inline-flex min-h-9 sm:min-h-11 items-center gap-0.5 sm:gap-1 rounded-xl sm:rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-1 sm:p-1.5 shadow-[var(--shadow-sm)] backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
            <button
              type="button"
              onClick={onPrevious}
              className="inline-flex min-h-7 sm:min-h-9 items-center gap-1 rounded-lg sm:rounded-xl px-2 sm:px-3 text-[12px] sm:text-[13px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:shadow-[var(--shadow-sm)] dark:hover:bg-[var(--surface-2)]"
              aria-label="Periodo anterior"
            >
              <AppIcon icon={ChevronLeft} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <button
              type="button"
              onClick={onToday}
              className="min-h-7 sm:min-h-9 rounded-lg sm:rounded-xl bg-[var(--surface-3)] px-2.5 sm:px-4 text-[12px] sm:text-[13px] font-bold tracking-tight text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--surface-2)] active:scale-[0.98] border border-[var(--border-strong)] dark:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:hover:bg-[var(--surface-1)]"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex min-h-7 sm:min-h-9 items-center gap-1 rounded-lg sm:rounded-xl px-2 sm:px-3 text-[12px] sm:text-[13px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:shadow-[var(--shadow-sm)] dark:hover:bg-[var(--surface-2)]"
              aria-label="Periodo siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <AppIcon icon={ChevronRight} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* View Selector (Día | Semana | Mensual) */}
          <div role="tablist" aria-label="Selector de vista" className="inline-flex min-h-9 sm:min-h-11 items-center gap-0.5 sm:gap-1 rounded-xl sm:rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-1 sm:p-1.5 shadow-[var(--shadow-sm)] backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
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
                  className={`min-h-7 sm:min-h-9 rounded-lg sm:rounded-xl px-2.5 sm:px-4 text-[12px] sm:text-[13px] font-semibold transition-all ${active
                    ? "bg-[linear-gradient(90deg,var(--app-primary),var(--app-primary-strong))] text-[var(--surface-3)] shadow-[var(--shadow-md)] border border-[var(--border-soft)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:shadow-[var(--shadow-sm)] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[var(--surface-2)] dark:hover:text-[var(--text-primary)]"
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
