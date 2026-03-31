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
    <header className="rounded-3xl border border-zinc-800 bg-zinc-900/75 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Agenda operativa</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-100 sm:text-2xl">{title}</h2>
          <p className="mt-1 text-xs text-zinc-400">Zona horaria canonica: {timezone}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex min-h-11 items-center rounded-xl border border-zinc-700 bg-zinc-950/70 p-1.5">
            <button
              type="button"
              onClick={onPrevious}
              className="min-h-9 rounded-lg px-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              aria-label="Periodo anterior"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onToday}
              className="min-h-9 rounded-lg px-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={onNext}
              className="min-h-9 rounded-lg px-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              aria-label="Periodo siguiente"
            >
              Siguiente
            </button>
          </div>

          <div role="tablist" aria-label="Selector de vista" className="inline-flex min-h-11 rounded-xl border border-zinc-700 bg-zinc-950/70 p-1.5">
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
                  className={`min-h-9 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                    active
                      ? "bg-emerald-500 text-zinc-950"
                      : "text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
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
