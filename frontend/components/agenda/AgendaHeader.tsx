import type { AgendaView } from "@/lib/agenda/types";

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
    <header className="dashboard-surface-1 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="dashboard-text-muted text-[11px] font-semibold uppercase tracking-[0.2em]">Agenda operativa</p>
          <h2 className="dashboard-title mt-2 text-xl font-semibold sm:text-2xl">{title}</h2>
          <p className="dashboard-text-secondary mt-1 text-xs">Zona horaria canonica: {timezone}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="dashboard-surface-2 inline-flex min-h-11 items-center p-1.5">
            <button
              type="button"
              onClick={onPrevious}
              className="dashboard-interactive dashboard-focusable min-h-9 rounded-[var(--dashboard-radius-sm)] px-3 text-sm font-medium [color:var(--dashboard-text-secondary)] hover:bg-[color:color-mix(in_oklab,var(--dashboard-surface-1)_88%,transparent)]"
              aria-label="Periodo anterior"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onToday}
              className="dashboard-interactive dashboard-focusable min-h-9 rounded-[var(--dashboard-radius-sm)] border border-teal-300/70 bg-teal-500 px-3 text-sm font-semibold text-slate-950 hover:bg-teal-400"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={onNext}
              className="dashboard-interactive dashboard-focusable min-h-9 rounded-[var(--dashboard-radius-sm)] px-3 text-sm font-medium [color:var(--dashboard-text-secondary)] hover:bg-[color:color-mix(in_oklab,var(--dashboard-surface-1)_88%,transparent)]"
              aria-label="Periodo siguiente"
            >
              Siguiente
            </button>
          </div>

          <div role="tablist" aria-label="Selector de vista" className="dashboard-surface-2 inline-flex min-h-11 p-1.5">
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
                  className={`dashboard-interactive dashboard-focusable min-h-9 rounded-[var(--dashboard-radius-sm)] px-3 text-sm font-medium ${
                    active
                      ? "border border-teal-300/70 bg-teal-500 text-slate-950"
                      : "[color:var(--dashboard-text-secondary)] hover:bg-[color:color-mix(in_oklab,var(--dashboard-surface-1)_88%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
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
