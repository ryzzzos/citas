interface AgendaStatusProps {
  message: string;
  onRetry?: () => void;
}

export function AgendaLoadingState() {
  return (
    <section className="flex min-h-[320px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/70" aria-busy="true" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-300" />
      <p className="sr-only">Cargando agenda</p>
    </section>
  );
}

export function AgendaErrorState({ message, onRetry }: AgendaStatusProps) {
  return (
    <section className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-5 text-rose-100" role="alert">
      <h3 className="text-lg font-semibold">Error al cargar agenda</h3>
      <p className="mt-2 text-sm">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-11 rounded-xl border border-rose-300/40 bg-rose-400/10 px-4 text-sm font-semibold transition hover:bg-rose-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          Reintentar
        </button>
      ) : null}
    </section>
  );
}

export function AgendaEmptyState({ message }: AgendaStatusProps) {
  return (
    <section className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/65 p-6 text-center">
      <h3 className="text-lg font-semibold text-zinc-100">Agenda sin citas</h3>
      <p className="mt-2 text-sm text-zinc-400">{message}</p>
    </section>
  );
}
