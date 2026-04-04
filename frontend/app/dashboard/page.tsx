"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, CheckCircle2, CircleDashed, ClipboardList, Compass, Hourglass, TrendingUp } from "lucide-react";
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
  pending: "border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-200",
  confirmed: "border border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-500/35 dark:bg-teal-500/15 dark:text-teal-200",
  cancelled: "border border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-200",
  completed: "border border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/35 dark:bg-sky-500/15 dark:text-sky-200",
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
      <div className="dashboard-surface-1 flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-teal-500 dark:border-slate-700 dark:border-t-teal-300" />
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="dashboard-surface-1 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Agenda Web</p>
        <h2 className="dashboard-title mt-3 text-2xl font-semibold sm:text-3xl">
          Hola, {user?.name}
        </h2>
        <p className="dashboard-text-secondary mt-2 max-w-2xl text-sm leading-6">
          {user?.role === "business_owner"
            ? "Administra la operacion de tu negocio, revisa reservas y monitorea actividad desde un mismo panel."
            : "Consulta tus proximas reservas y accede rapido al marketplace para reservar nuevos servicios."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {user?.role === "business_owner" ? (
            <Link
              href="/dashboard/agenda"
              className="dashboard-interactive dashboard-focusable inline-flex min-h-11 items-center gap-2 rounded-[var(--dashboard-radius-md)] border border-teal-300/70 bg-teal-500 px-4 text-sm font-semibold text-slate-950 hover:bg-teal-400"
            >
              <AppIcon icon={CalendarDays} />
              Abrir agenda
            </Link>
          ) : null}
          <Link
            href="/marketplace"
            className="dashboard-surface-2 dashboard-interactive dashboard-focusable inline-flex min-h-11 items-center gap-2 px-4 text-sm font-semibold [color:var(--dashboard-text-secondary)]"
          >
            <AppIcon icon={Compass} />
            Explorar marketplace
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="dashboard-surface-2 p-4">
          <AppIcon icon={ClipboardList} className="dashboard-text-muted" />
          <p className="dashboard-text-muted text-[11px] font-semibold uppercase tracking-[0.16em]">Reservas</p>
          <p className="dashboard-title mt-2 text-2xl font-semibold">{bookings.length}</p>
          <p className="dashboard-text-secondary mt-1 text-xs">En el rango consultado</p>
        </article>
        <article className="dashboard-surface-2 p-4">
          <AppIcon icon={Hourglass} className="text-amber-700 dark:text-amber-200" />
          <p className="dashboard-text-muted text-[11px] font-semibold uppercase tracking-[0.16em]">Pendientes</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700 dark:text-amber-200">
            {bookings.filter((booking) => booking.status === "pending").length}
          </p>
          <p className="dashboard-text-secondary mt-1 text-xs">Requieren accion</p>
        </article>
        <article className="dashboard-surface-2 p-4">
          <AppIcon icon={TrendingUp} className="text-teal-700 dark:text-teal-200" />
          <p className="dashboard-text-muted text-[11px] font-semibold uppercase tracking-[0.16em]">Confirmadas</p>
          <p className="mt-2 text-2xl font-semibold text-teal-700 dark:text-teal-200">
            {bookings.filter((booking) => booking.status === "confirmed").length}
          </p>
          <p className="dashboard-text-secondary mt-1 text-xs">Listas para atender</p>
        </article>
        <article className="dashboard-surface-2 p-4">
          <AppIcon icon={CheckCircle2} className="text-sky-700 dark:text-sky-200" />
          <p className="dashboard-text-muted text-[11px] font-semibold uppercase tracking-[0.16em]">Completadas</p>
          <p className="mt-2 text-2xl font-semibold text-sky-700 dark:text-sky-200">
            {bookings.filter((booking) => booking.status === "completed").length}
          </p>
          <p className="dashboard-text-secondary mt-1 text-xs">Finalizadas con exito</p>
        </article>
      </section>

      <section className="dashboard-surface-1 p-5 sm:p-6">
        <h3 className="dashboard-title text-lg font-semibold">
          {user?.role === "business_owner" ? "Ultimas reservas" : "Mis reservas"}
        </h3>

        {bookings.length === 0 ? (
          <div className="dashboard-text-secondary mt-4 rounded-[var(--dashboard-radius-md)] border border-dashed border-[color:var(--dashboard-border-default)] p-8 text-center text-sm">
            <AppIcon icon={CircleDashed} size="md" className="mx-auto mb-2" />
            No hay reservas aun. <Link href="/marketplace" className="dashboard-focusable rounded-sm text-teal-700 underline underline-offset-4 dark:text-teal-300">Busca un negocio</Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="dashboard-surface-2 flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="dashboard-title text-sm font-medium">
                    {b.booking_date} · {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                  </p>
                  <p className="dashboard-text-muted text-xs">ID: {b.id.slice(0, 8)}...</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[b.status] ?? STATUS_COLORS.pending}`}
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
