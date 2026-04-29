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
  pending: "border border-amber-200/60 bg-amber-500/10 text-amber-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  confirmed: "border border-blue-200/60 bg-blue-500/10 text-blue-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  cancelled: "border border-rose-200/60 bg-rose-500/10 text-rose-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  completed: "border border-slate-200/60 bg-slate-500/10 text-slate-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300",
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
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--app-primary)] dark:border-slate-700 dark:border-t-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <section className="rounded-3xl border border-white/50 bg-white/60 p-6 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--app-primary)] dark:text-blue-400">Agenda Web</p>
        <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Hola, {user?.name}
        </h2>
        <p className="mt-1.5 max-w-2xl text-[14px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          {user?.role === "business_owner"
            ? "Administra la operación de tu negocio, revisa reservas y monitorea actividad desde un mismo panel."
            : "Consulta tus próximas reservas y accede rápido al mapa de sucursales para reservar nuevos servicios."}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {user?.role === "business_owner" ? (
            <Link
              href="/dashboard/agenda"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.4)] bg-[var(--app-primary-gradient)] px-5 text-[13px] font-bold tracking-tight text-white shadow-[0_4px_14px_-6px_rgba(37,99,235,0.4),inset_0_1px_rgba(255,255,255,0.25)] transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <AppIcon icon={CalendarDays} />
              Abrir agenda
            </Link>
          ) : null}
          <Link
            href="/sucursales"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-5 text-[13px] font-bold tracking-tight text-zinc-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05),inset_0_1px_rgba(255,255,255,0.5)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm active:scale-[0.98] dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
          >
            <AppIcon icon={Compass} />
            Explorar sucursales
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-white/50 bg-white/60 p-5 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
          <AppIcon icon={ClipboardList} className="text-slate-400" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Reservas</p>
          <p className="mt-1 text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">{bookings.length}</p>
          <p className="mt-1 text-[12px] font-medium text-slate-500 dark:text-slate-400">En el rango consultado</p>
        </article>
        <article className="rounded-3xl border border-white/50 bg-white/60 p-5 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
          <AppIcon icon={Hourglass} className="text-amber-500" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Pendientes</p>
          <p className="mt-1 text-[28px] font-bold tracking-tight text-amber-900 dark:text-amber-100">
            {bookings.filter((booking) => booking.status === "pending").length}
          </p>
          <p className="mt-1 text-[12px] font-medium text-slate-500 dark:text-slate-400">Requieren acción</p>
        </article>
        <article className="rounded-3xl border border-white/50 bg-white/60 p-5 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
          <AppIcon icon={TrendingUp} className="text-[var(--app-primary)] dark:text-blue-400" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-primary)] dark:text-blue-400">Confirmadas</p>
          <p className="mt-1 text-[28px] font-bold tracking-tight text-blue-900 dark:text-blue-100">
            {bookings.filter((booking) => booking.status === "confirmed").length}
          </p>
          <p className="mt-1 text-[12px] font-medium text-slate-500 dark:text-slate-400">Listas para atender</p>
        </article>
        <article className="rounded-3xl border border-white/50 bg-white/60 p-5 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
          <AppIcon icon={CheckCircle2} className="text-slate-400" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Completadas</p>
          <p className="mt-1 text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">
            {bookings.filter((booking) => booking.status === "completed").length}
          </p>
          <p className="mt-1 text-[12px] font-medium text-slate-500 dark:text-slate-400">Finalizadas con éxito</p>
        </article>
      </section>

      <section className="rounded-3xl border border-white/50 bg-white/60 p-6 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
        <h3 className="text-[19px] font-bold tracking-tight text-slate-900 dark:text-white">
          {user?.role === "business_owner" ? "Últimas reservas" : "Mis reservas"}
        </h3>

        {bookings.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-[14px] font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <AppIcon icon={CircleDashed} size="md" className="mx-auto mb-3" />
            No hay reservas aún. <Link href="/sucursales" className="text-[var(--app-primary)] underline underline-offset-4 dark:text-blue-400">Busca una sucursal</Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-transform hover:scale-[1.01] dark:border-zinc-800/60 dark:bg-zinc-900/50"
              >
                <div>
                  <p className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white">
                    {b.booking_date} · {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                  </p>
                  <p className="mt-1 font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">ID: {b.id.slice(0, 8)}...</p>
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
