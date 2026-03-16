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
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  completed: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
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
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">
        Hola, {user?.name} 👋
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        {user?.role === "business_owner"
          ? "Panel de negocio"
          : "Tus reservas próximas"}
      </p>

      {user?.role === "business_owner" && (
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard/business"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Gestionar negocio
          </Link>
          <Link
            href="/dashboard/agenda"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Ver agenda
          </Link>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          {user?.role === "business_owner" ? "Últimas reservas" : "Mis reservas"}
        </h2>
        {bookings.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 p-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
            No tienes reservas aún.{" "}
            <Link href="/marketplace" className="underline">
              Busca un negocio
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {b.booking_date} · {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
                  </p>
                  <p className="text-xs text-zinc-500">ID: {b.id.slice(0, 8)}…</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[b.status]}`}
                >
                  {STATUS_LABELS[b.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
