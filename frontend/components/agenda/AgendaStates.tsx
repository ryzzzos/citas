interface AgendaStatusProps {
  message: string;
  onRetry?: () => void;
}

export function AgendaLoadingState() {
  return (
    <section className="dashboard-surface-1 flex min-h-[320px] items-center justify-center" aria-busy="true" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)] dark:border-[var(--border-strong)] dark:border-t-[var(--app-primary)]" />
      <p className="sr-only">Cargando agenda</p>
    </section>
  );
}

export function AgendaErrorState({ message, onRetry }: AgendaStatusProps) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-error)] bg-[var(--surface-3)] p-5 text-[var(--color-error)]" role="alert">
      <h3 className="text-lg font-semibold">Error al cargar agenda</h3>
      <p className="mt-2 text-sm">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="dashboard-interactive dashboard-focusable mt-4 min-h-11 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--surface-3)] px-4 text-sm font-semibold text-[var(--color-error)] hover:bg-[var(--surface-2)]"
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
