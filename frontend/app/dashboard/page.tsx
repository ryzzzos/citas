"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, CheckCircle2, CircleDashed, ClipboardList, Compass, Hourglass, TrendingUp, TrendingDown, Minus, XCircle } from "lucide-react";
import { getMe, myBookings } from "@/lib/api";
import AppIcon from "@/components/ui/AppIcon";
import type { Booking, User } from "@/types";


const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "border border-[var(--color-pending)] bg-[var(--surface-3)] text-[var(--color-pending)] shadow-[var(--shadow-sm)]",
  confirmed: "border border-[var(--color-info)] bg-[var(--surface-3)] text-[var(--color-info)] shadow-[var(--shadow-sm)]",
  cancelled: "border border-[var(--color-error)] bg-[var(--surface-3)] text-[var(--color-error)] shadow-[var(--shadow-sm)]",
  completed: "border border-[var(--color-success)] bg-[var(--surface-3)] text-[var(--color-success)] shadow-[var(--shadow-sm)]",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [me, bks] = await Promise.all([getMe(), myBookings()]);
        setUser(me);
        setBookings(bks);
      } catch {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)] dark:border-[var(--border-strong)] dark:border-t-[var(--app-primary)]" />
      </div>
    );
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

  const pendingPct = totalBookings > 0 ? Math.round((pendingBookings / totalBookings) * 100) : 0;
  const confirmedPct = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0;
  const completedPct = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
  const cancelledPct = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)]  dark:border border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[var(--shadow-md)] p-6">
        <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl ">
          Hola, {user?.name}
        </h2>
        <p className="mt-1.5 max-w-2xl text-[14px] font-medium leading-relaxed text-[var(--text-secondary)]">
          {user?.role === "business_owner"
            ? "Administra la operación de tu negocio, revisa reservas y monitorea actividad desde un mismo panel."
            : "Consulta tus próximas reservas y accede rápido al mapa de sucursales para reservar nuevos servicios."}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {user?.role === "business_owner" ? (
            <Link
              href="/dashboard/agenda"
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-5 text-[13px] font-bold tracking-tight text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--surface-1)] active:scale-[0.98]"
            >
              <AppIcon icon={CalendarDays} />
              Abrir agenda
            </Link>
          ) : null}
          <Link
            href="/sucursales"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-5 text-[13px] font-bold tracking-tight text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--surface-3)] active:scale-[0.98] dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-3)]"
          >
            <AppIcon icon={Compass} />
            Explorar sucursales
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Reservas Totales */}
        <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--surface-3)]">
                <AppIcon icon={ClipboardList} size="md" />
              </div>
              <p className="text-[16px] font-semibold text-[var(--text-primary)]">Reservas</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-[var(--text-primary)]">
              <AppIcon icon={TrendingUp} size="md" className="h-4 w-4" />
              <span>100%</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="my-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">{totalBookings}</p>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-1)]">
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--text-primary)]" style={{ width: totalBookings > 0 ? '100%' : '0%' }}></div>
            </div>
          </div>
        </article>

        {/* Pendientes */}
        <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-pending)] text-[var(--surface-3)]">
                <AppIcon icon={Hourglass} size="md" />
              </div>
              <p className="text-[16px] font-semibold text-[var(--text-primary)]">Pendientes</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-pending)]">
              <AppIcon icon={pendingPct > 0 ? TrendingUp : Minus} size="md" className="h-4 w-4" />
              <span>{pendingPct}%</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="my-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">{pendingBookings}</p>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-1)]">
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-pending)]" style={{ width: `${pendingPct}%` }}></div>
            </div>
          </div>
        </article>

        {/* Confirmadas */}
        <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-info)] text-[var(--surface-3)]">
                <AppIcon icon={TrendingUp} size="md" />
              </div>
              <p className="text-[16px] font-semibold text-[var(--text-primary)]">Confirmadas</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-info)]">
              <AppIcon icon={confirmedPct > 0 ? TrendingUp : Minus} size="md" className="h-4 w-4" />
              <span>{confirmedPct}%</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="my-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">{confirmedBookings}</p>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-1)]">
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-info)]" style={{ width: `${confirmedPct}%` }}></div>
            </div>
          </div>
        </article>

        {/* Completadas */}
        <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-success)] text-[var(--surface-3)]">
                <AppIcon icon={CheckCircle2} size="md" />
              </div>
              <p className="text-[16px] font-semibold text-[var(--text-primary)]">Completadas</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-success)]">
              <AppIcon icon={completedPct > 0 ? TrendingUp : Minus} size="md" className="h-4 w-4" />
              <span>{completedPct}%</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="my-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">{completedBookings}</p>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-1)]">
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-success)]" style={{ width: `${completedPct}%` }}></div>
            </div>
          </div>
        </article>

        {/* Canceladas */}
        <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-error)] text-[var(--surface-3)]">
                <AppIcon icon={XCircle} size="md" />
              </div>
              <p className="text-[16px] font-semibold text-[var(--text-primary)]">Canceladas</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-error)]">
              <AppIcon icon={cancelledPct > 0 ? TrendingUp : Minus} size="md" className="h-4 w-4" />
              <span>{cancelledPct}%</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="my-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">{cancelledBookings}</p>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-1)]">
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-error)]" style={{ width: `${cancelledPct}%` }}></div>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-6 shadow-[var(--shadow-md)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[var(--shadow-lg)]">
        <h3 className="text-[19px] font-bold tracking-tight text-[var(--text-primary)] ">
          {user?.role === "business_owner" ? "Últimas reservas" : "Mis reservas"}
        </h3>

        {bookings.length === 0 ? (
          <div className="mt-5 rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] p-8 text-center text-[14px] font-medium text-[var(--text-muted)]">
            <AppIcon icon={CircleDashed} size="md" className="mx-auto mb-3" />
            No hay reservas aún. <Link href="/sucursales" className="text-[var(--app-primary)] underline underline-offset-4">Busca una sucursal</Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-sm)] transition-transform hover:scale-[1.01] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]"
              >
                <div>
                  <p className="text-[14px] font-bold tracking-tight text-[var(--text-primary)] ">
                    {b.booking_date} · {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                  </p>
                  <p className="mt-1 font-mono text-[11px] font-medium text-[var(--text-secondary)]">ID: {b.id.slice(0, 8)}...</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${STATUS_COLORS[b.status] ?? STATUS_COLORS.pending}`}
                >
                  {STATUS_LABELS[b.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
