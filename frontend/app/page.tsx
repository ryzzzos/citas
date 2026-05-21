import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-1 text-xs font-medium text-[var(--text-secondary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] ">
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
            className="rounded-full bg-[linear-gradient(180deg,var(--app-primary),var(--app-primary-strong))] px-6 py-3 text-sm font-semibold text-[var(--surface-3)]
             transition-colors hover:brightness-110"
          >
            Registra tu negocio
          </Link>
          <Link
            href="/sucursales"
            className="rounded-full border border-[var(--border-strong)] px-6 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:hover:bg-[var(--surface-2)]"
          >
            Explorar sucursales
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-20 dark:border-[var(--border-strong)] dark:bg-[var(--surface-0)]">
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
               className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-6 dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]"
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
