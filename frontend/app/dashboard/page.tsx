"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMe, myBookings } from "@/lib/api";
import type { Booking, User } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "border border-amber-500/30 bg-amber-400/10 text-amber-300",
  confirmed: "border border-emerald-500/30 bg-emerald-400/10 text-emerald-300",
  cancelled: "border border-rose-500/30 bg-rose-400/10 text-rose-300",
  completed: "border border-sky-500/30 bg-sky-400/10 text-sky-300",
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
      <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/70">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.9)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">Agenda Web</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
          Hola, {user?.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          {user?.role === "business_owner"
            ? "Administra la operacion de tu negocio, revisa reservas y monitorea actividad desde un mismo panel."
            : "Consulta tus proximas reservas y accede rapido al marketplace para reservar nuevos servicios."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {user?.role === "business_owner" ? (
            <Link
              href="/dashboard/agenda"
              className="inline-flex min-h-11 items-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            >
              Abrir agenda
            </Link>
          ) : null}
          <Link
            href="/marketplace"
            className="inline-flex min-h-11 items-center rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            Explorar marketplace
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Reservas</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">{bookings.length}</p>
          <p className="mt-1 text-xs text-zinc-400">En el rango consultado</p>
        </article>
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Pendientes</p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">
            {bookings.filter((booking) => booking.status === "pending").length}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Requieren accion</p>
        </article>
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Confirmadas</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {bookings.filter((booking) => booking.status === "confirmed").length}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Listas para atender</p>
        </article>
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Completadas</p>
          <p className="mt-2 text-2xl font-semibold text-sky-300">
            {bookings.filter((booking) => booking.status === "completed").length}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Finalizadas con exito</p>
        </article>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.85)] sm:p-6">
        <h3 className="text-lg font-semibold text-zinc-100">
          {user?.role === "business_owner" ? "Ultimas reservas" : "Mis reservas"}
        </h3>

        {bookings.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-400">
            No hay reservas aun. <Link href="/marketplace" className="text-emerald-300 underline underline-offset-4">Busca un negocio</Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {b.booking_date} · {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                  </p>
                  <p className="text-xs text-zinc-500">ID: {b.id.slice(0, 8)}...</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[b.status]}`}
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
