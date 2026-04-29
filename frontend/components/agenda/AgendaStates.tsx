interface AgendaStatusProps {
  message: string;
  onRetry?: () => void;
}

export function AgendaLoadingState() {
  return (
    <section className="dashboard-surface-1 flex min-h-[320px] items-center justify-center" aria-busy="true" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--app-primary)] dark:border-slate-700 dark:border-t-blue-400" />
      <p className="sr-only">Cargando agenda</p>
    </section>
  );
}

export function AgendaErrorState({ message, onRetry }: AgendaStatusProps) {
  return (
    <section className="rounded-[var(--dashboard-radius-xl)] border border-rose-300 bg-rose-50 p-5 text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100" role="alert">
      <h3 className="text-lg font-semibold">Error al cargar agenda</h3>
      <p className="mt-2 text-sm">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="dashboard-interactive dashboard-focusable mt-4 min-h-11 rounded-[var(--dashboard-radius-md)] border border-rose-300 bg-white/80 px-4 text-sm font-semibold text-rose-800 hover:bg-white dark:border-rose-300/40 dark:bg-rose-400/10 dark:text-rose-100 dark:hover:bg-rose-400/20"
        >
          Reintentar
        </button>
      ) : null}
    </section>
  );
}

export function AgendaEmptyState({ message }: AgendaStatusProps) {
  return (
    <section className="dashboard-surface-1 border-dashed p-6 text-center">
      <h3 className="dashboard-title text-lg font-semibold">Agenda sin citas</h3>
      <p className="dashboard-text-secondary mt-2 text-sm">{message}</p>
    </section>
  );
}
