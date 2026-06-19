"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CalendarDays, CheckCircle2, CircleDashed, ClipboardList, Compass, 
  Hourglass, TrendingUp, Minus, XCircle, ChevronLeft, ChevronRight, User, MapPin
} from "lucide-react";
import { getMe, myBookings, getMyBusiness, businessAgenda } from "@/lib/api";
import AppIcon from "@/components/ui/AppIcon";
import type { Booking, User as UserType } from "@/types";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const me = await getMe();
        if (!mounted) return;
        setUser(me);

        let bks: Booking[] = [];
        if (me.role === "business_owner") {
          const myBiz = await getMyBusiness().catch(() => null);
          if (myBiz) {
            const startStr = format(startOfMonth(currentMonth), "yyyy-MM-dd");
            const endStr = format(endOfMonth(currentMonth), "yyyy-MM-dd");
            bks = await businessAgenda(myBiz.id, {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              from_at: new Date(startStr + "T00:00:00").toISOString(),
              to_at: new Date(endStr + "T23:59:59").toISOString(),
            });
          }
        } else {
          const allBks = await myBookings();
          bks = allBks.filter((b) => {
            const d = new Date(b.booking_date + "T12:00:00");
            return isSameMonth(d, currentMonth);
          });
        }
        
        if (mounted) setBookings(bks);
      } catch {
        router.push("/auth/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [router, currentMonth]);

  if (loading && !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
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
    <div className="flex flex-col h-full space-y-6 lg:space-y-8">
      <div className="shrink-0 space-y-6 lg:space-y-8">
        {/* Hero / Welcome */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Hola, {user?.name}
            </h2>
            <p className="max-w-2xl text-[14px] font-medium leading-relaxed text-[var(--text-secondary)]">
              {user?.role === "business_owner"
                ? "Administra la operación de tu negocio, revisa reservas y monitorea actividad desde un mismo panel."
                : "Consulta tus próximas reservas y accede rápido al mapa de sucursales para reservar nuevos servicios."}
            </p>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-1 sm:gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-1.5 py-1 shadow-[var(--shadow-sm)] shrink-0 self-start sm:self-auto">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[110px] text-center text-[13px] sm:text-sm font-semibold capitalize text-[var(--text-primary)]">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </span>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

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
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-5 text-[13px] font-bold tracking-tight text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--surface-3)] active:scale-[0.98]"
          >
            <AppIcon icon={Compass} />
            Explorar sucursales
          </Link>
        </div>
      </section>

      {/* Metric cards */}
      <section className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ${loading ? 'opacity-50' : ''} transition-opacity`}>
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
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--text-primary)]" style={{ width: totalBookings > 0 ? '100%' : '0%' }} />
            </div>
          </div>
        </article>

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
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-pending)]" style={{ width: `${pendingPct}%` }} />
            </div>
          </div>
        </article>

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
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-info)]" style={{ width: `${confirmedPct}%` }} />
            </div>
          </div>
        </article>

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
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-success)]" style={{ width: `${completedPct}%` }} />
            </div>
          </div>
        </article>

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
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-error)]" style={{ width: `${cancelledPct}%` }} />
            </div>
          </div>
        </article>
      </section>
      </div>

      {/* Booking list */}
      <section className={`flex-1 min-h-0 flex flex-col rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-6 shadow-[var(--shadow-sm)] ${loading ? 'opacity-50' : ''} transition-opacity`}>
        <h3 className="shrink-0 text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
          {user?.role === "business_owner" ? "Últimas reservas" : "Mis reservas"}
        </h3>

        {bookings.length === 0 ? (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] p-8 text-center text-[14px] font-medium text-[var(--text-muted)]">
            <AppIcon icon={CircleDashed} size="md" className="mx-auto mb-3" />
            No hay reservas para este mes.{" "}
            {user?.role !== "business_owner" && (
              <>
                <Link href="/sucursales" className="text-[var(--app-primary)] underline underline-offset-4">
                  Busca una sucursal
                </Link>{" "}
                para empezar.
              </>
            )}
          </div>
        ) : (
          <div
            className="mt-4 flex-1 min-h-0 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border-strong)]"
          >
            <div className="space-y-2">
              {bookings.map((b) => {
                const statusColor = {
                  pending: "var(--color-pending)",
                  confirmed: "var(--color-info)",
                  completed: "var(--color-success)",
                  cancelled: "var(--color-error)",
                }[b.status] ?? "var(--color-pending)";

                return (
                  <div
                    key={b.id}
                    className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3.5 transition-all hover:bg-[var(--surface-3)] hover:shadow-[var(--shadow-sm)]"
                  >
                    {/* Vertical status accent */}
                    <div
                      className="hidden sm:block w-1 self-stretch rounded-full shrink-0"
                      style={{ backgroundColor: statusColor }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] truncate">
                          {b.service_name || "Servicio reservado"}
                        </p>
                        <span
                          className="shrink-0 rounded-full px-2 py-px text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            color: statusColor,
                            backgroundColor: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
                          }}
                        >
                          {STATUS_LABELS[b.status]}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <User size={12} className="opacity-60" />
                          {b.staff_name || "Sin asignar"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="opacity-60" />
                          {b.branch_name || "Sucursal"}
                        </span>
                        {user?.role === "business_owner" && b.customer_name && (
                          <span className="text-[var(--text-secondary)] font-medium">
                            → {b.customer_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date column */}
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
                        {format(new Date(b.booking_date + "T" + b.start_time), "d MMM", { locale: es })}
                      </p>
                      <p className="text-[11px] tabular-nums text-[var(--text-muted)]">
                        {format(new Date(b.booking_date + "T" + b.start_time), "h:mm a", { locale: es })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
