"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CalendarDays, CheckCircle2, CircleDashed, ClipboardList, Compass, 
  Hourglass, TrendingUp, TrendingDown, Minus, XCircle, ChevronLeft, ChevronRight, User, MapPin
} from "lucide-react";
import { getMe, myBookings, getMyBusiness, businessAgenda } from "@/lib/api";
import AppIcon from "@/components/ui/AppIcon";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { KpiCard } from "@/components/charts/KpiCard";
import { useBranchContext } from "@/contexts/BranchContext";
import type { Booking, User as UserType } from "@/types";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, startOfWeek, endOfWeek, subWeeks, addWeeks } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function DashboardPage() {
  const router = useRouter();
  const { activeBranch } = useBranchContext();
  const [user, setUser] = useState<UserType | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [weeklyBookings, setWeeklyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const me = await getMe();
        if (!mounted) return;
        setUser(me);

        let weekBks: Booking[] = [];

        // Monday of last week to Sunday of selected week
        const startOfLastWeek = startOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });
        const endOfThisWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
        
        const startStr = format(startOfLastWeek, "yyyy-MM-dd");
        const endStr = format(endOfThisWeek, "yyyy-MM-dd");

        if (me.role === "business_owner") {
          const myBiz = await getMyBusiness().catch(() => null);
          if (myBiz) {
            weekBks = await businessAgenda(myBiz.id, {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              branch_id: activeBranch?.id || undefined,
              from_at: new Date(startStr + "T00:00:00").toISOString(),
              to_at: new Date(endStr + "T23:59:59").toISOString(),
            });
          }
        } else {
          const allBks = await myBookings();
          // Filter locally for customer
          weekBks = allBks.filter((b) => {
            const d = new Date(b.booking_date + "T12:00:00");
            return d >= startOfLastWeek && d <= endOfThisWeek;
          });
        }
        
        if (mounted) {
          setBookings(weekBks);
          setWeeklyBookings(weekBks);
        }
      } catch {
        router.push("/auth/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [router, currentDate, activeBranch]);

  if (loading && !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
      </div>
    );
  }

  const startOfThisWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
  const startOfLastWeek = startOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });
  const endOfLastWeek = endOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });

  const isBetween = (dateStr: string, start: Date, end: Date) => {
    const d = new Date(dateStr + "T00:00:00");
    return d >= start && d <= end;
  };

  const thisWeekBks = weeklyBookings.filter((b) => isBetween(b.booking_date, startOfThisWeek, endOfThisWeek));
  const lastWeekBks = weeklyBookings.filter((b) => isBetween(b.booking_date, startOfLastWeek, endOfLastWeek));

  // Reservas
  const thisWeekTotal = thisWeekBks.length;
  const lastWeekTotal = lastWeekBks.length;
  const totalPct = 100;
  const totalBar = lastWeekTotal > 0 ? Math.min(100, Math.round((thisWeekTotal / lastWeekTotal) * 100)) : (thisWeekTotal > 0 ? 100 : 0);

  // Pendientes
  const thisWeekPending = thisWeekBks.filter((b) => b.status === "pending").length;
  const lastWeekPending = lastWeekBks.filter((b) => b.status === "pending").length;
  const pendingPct = thisWeekTotal > 0 ? Math.round((thisWeekPending / thisWeekTotal) * 100) : 0;
  const pendingBar = lastWeekPending > 0 ? Math.min(100, Math.round((thisWeekPending / lastWeekPending) * 100)) : (thisWeekPending > 0 ? 100 : 0);

  // Confirmadas
  const thisWeekConfirmed = thisWeekBks.filter((b) => b.status === "confirmed").length;
  const lastWeekConfirmed = lastWeekBks.filter((b) => b.status === "confirmed").length;
  const confirmedPct = thisWeekTotal > 0 ? Math.round((thisWeekConfirmed / thisWeekTotal) * 100) : 0;
  const confirmedBar = lastWeekConfirmed > 0 ? Math.min(100, Math.round((thisWeekConfirmed / lastWeekConfirmed) * 100)) : (thisWeekConfirmed > 0 ? 100 : 0);

  // Completadas
  const thisWeekCompleted = thisWeekBks.filter((b) => b.status === "completed").length;
  const lastWeekCompleted = lastWeekBks.filter((b) => b.status === "completed").length;
  const completedPct = thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0;
  const completedBar = lastWeekCompleted > 0 ? Math.min(100, Math.round((thisWeekCompleted / lastWeekCompleted) * 100)) : (thisWeekCompleted > 0 ? 100 : 0);

  // Canceladas
  const thisWeekCancelled = thisWeekBks.filter((b) => b.status === "cancelled").length;
  const lastWeekCancelled = lastWeekBks.filter((b) => b.status === "cancelled").length;
  const cancelledPct = thisWeekTotal > 0 ? Math.round((thisWeekCancelled / thisWeekTotal) * 100) : 0;
  const cancelledBar = lastWeekCancelled > 0 ? Math.min(100, Math.round((thisWeekCancelled / lastWeekCancelled) * 100)) : (thisWeekCancelled > 0 ? 100 : 0);

  // Construct weekly label
  const startW = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endW = endOfWeek(currentDate, { weekStartsOn: 1 });

  let weekLabel = "";
  if (startW.getFullYear() === endW.getFullYear()) {
    if (startW.getMonth() === endW.getMonth()) {
      weekLabel = `${format(startW, "d")} - ${format(endW, "d MMM, yyyy", { locale: es })}`;
    } else {
      weekLabel = `${format(startW, "d MMM", { locale: es })} - ${format(endW, "d MMM, yyyy", { locale: es })}`;
    }
  } else {
    weekLabel = `${format(startW, "d MMM yyyy", { locale: es })} - ${format(endW, "d MMM yyyy", { locale: es })}`;
  }

  return (
    <div className="flex flex-col min-h-full space-y-5 lg:space-y-6">
      <div className="shrink-0 space-y-5 lg:space-y-6">
        {/* Hero / Welcome */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] p-5">
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

          {/* Week selector */}
          <div className="flex items-center gap-1 sm:gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-1.5 py-1 shadow-[var(--shadow-sm)] shrink-0 self-start sm:self-auto">
            <button 
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[160px] text-center text-[13px] sm:text-sm font-semibold capitalize text-[var(--text-primary)]">
              {weekLabel}
            </span>
            <button 
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
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

      <section className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ${loading ? 'opacity-50' : ''} transition-opacity`}>
        <KpiCard
          title="Reservas"
          value={thisWeekTotal}
          previousValue={lastWeekTotal}
          animateNumber={true}
          icon={ClipboardList}
          iconBgClass="bg-[var(--text-primary)] text-[var(--surface-3)]"
          trendPct={totalPct}
          trendColorClass="text-[var(--text-primary)]"
          showProgressBar={true}
          barColorClass="bg-[var(--text-primary)]"
          period="week"
        />

        <KpiCard
          title="Pendientes"
          value={thisWeekPending}
          previousValue={lastWeekPending}
          animateNumber={true}
          icon={Hourglass}
          iconBgClass="bg-[var(--color-pending)] text-[var(--surface-3)]"
          trendPct={pendingPct}
          trendColorClass="text-[var(--color-pending)]"
          showProgressBar={true}
          barColorClass="bg-[var(--color-pending)]"
          period="week"
        />

        <KpiCard
          title="Confirmadas"
          value={thisWeekConfirmed}
          previousValue={lastWeekConfirmed}
          animateNumber={true}
          icon={TrendingUp}
          iconBgClass="bg-[var(--color-info)] text-[var(--surface-3)]"
          trendPct={confirmedPct}
          trendColorClass="text-[var(--color-info)]"
          showProgressBar={true}
          barColorClass="bg-[var(--color-info)]"
          period="week"
        />

        <KpiCard
          title="Completadas"
          value={thisWeekCompleted}
          previousValue={lastWeekCompleted}
          animateNumber={true}
          icon={CheckCircle2}
          iconBgClass="bg-[var(--color-success)] text-[var(--surface-3)]"
          trendPct={completedPct}
          trendColorClass="text-[var(--color-success)]"
          showProgressBar={true}
          barColorClass="bg-[var(--color-success)]"
          period="week"
        />

        <KpiCard
          title="Canceladas"
          value={thisWeekCancelled}
          previousValue={lastWeekCancelled}
          animateNumber={true}
          icon={XCircle}
          iconBgClass="bg-[var(--color-error)] text-[var(--surface-3)]"
          trendPct={cancelledPct}
          trendColorClass="text-[var(--color-error)]"
          showProgressBar={true}
          barColorClass="bg-[var(--color-error)]"
          period="week"
        />
      </section>
      </div>

      <section className={`flex-1 min-h-0 flex flex-col rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] ${loading ? 'opacity-50' : ''} transition-opacity`}>
        <h3 className="shrink-0 text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
          {user?.role === "business_owner" ? "Últimas reservas" : "Mis reservas"}
        </h3>

        {thisWeekBks.length === 0 ? (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] p-8 text-center text-[14px] font-medium text-[var(--text-muted)]">
            <AppIcon icon={CircleDashed} size="md" className="mx-auto mb-3" />
            No hay reservas para esta semana.{" "}
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
              {thisWeekBks.map((b) => {
                const statusColor = {
                  pending: "var(--color-pending)",
                  confirmed: "var(--color-info)",
                  completed: "var(--color-success)",
                  cancelled: "var(--color-error)",
                }[b.status] ?? "var(--color-pending)";

                return (
                  <Link
                    key={b.id}
                    href={`/dashboard/agenda?date=${b.booking_date}&bookingId=${b.id}`}
                    className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3.5 transition-all hover:bg-[var(--surface-3)] hover:shadow-[var(--shadow-sm)] cursor-pointer"
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
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
