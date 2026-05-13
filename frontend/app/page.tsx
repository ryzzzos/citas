import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1 text-xs font-medium text-[var(--text-secondary)] dark:border-zinc-700 dark:bg-[var(--surface-1)] ">
          Plataforma SaaS de gestión de agenda
        </span>
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-[var(--text-primary)]">
          Gestiona tu agenda,{" "}
          <span className="text-[var(--text-muted)]">haz crecer tu negocio</span>
        </h1>
        <p className="max-w-lg text-lg text-[var(--text-muted)] ">
          Permite a tus clientes reservar en línea. Sin llamadas, sin
          confusiones. Solo más clientes y menos trabajo administrativo.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/register"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Registra tu negocio
          </Link>
          <Link
            href="/sucursales"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-[var(--surface-2)] dark:border-zinc-700  dark:hover:bg-[var(--surface-2)]"
          >
            Explorar sucursales
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-4 py-20 dark:border-zinc-800 dark:bg-[var(--surface-0)]">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {[
            {
              title: "Reservas online 24/7",
              description:
                "Tus clientes pueden agendar en cualquier momento desde cualquier dispositivo.",
            },
            {
              title: "Gestión de agenda",
              description:
                "Visualiza tu agenda diaria, semana o mes y administra confirmaciones.",
            },
            {
              title: "Sin doble reserva",
              description:
                "El sistema valida disponibilidad en tiempo real para evitar conflictos.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[var(--surface-1)]"
            >
              <h3 className="mb-2 font-semibold text-[var(--text-primary)]">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] ">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
