"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
	businessAgenda,
	getMyBusiness,
	getMe,
	listServices,
	listStaff,
	updateBookingStatus,
} from "@/lib/api";
import type { BookingStatusUpdate } from "@/lib/api";
import type { Booking, BookingStatus, Business, Service, Staff, User } from "@/types";

type StatusMeta = {
	label: string;
	badge: string;
	dot: string;
};

const STATUS_META: Record<BookingStatus, StatusMeta> = {
	pending: {
		label: "Pendiente",
		badge: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-200",
		dot: "bg-amber-500",
	},
	confirmed: {
		label: "Confirmada",
		badge: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-400/10 dark:text-emerald-200",
		dot: "bg-emerald-500",
	},
	cancelled: {
		label: "Cancelada",
		badge: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-400/10 dark:text-rose-200",
		dot: "bg-rose-500",
	},
	completed: {
		label: "Completada",
		badge: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-400/10 dark:text-sky-200",
		dot: "bg-sky-500",
	},
};

const STATUS_FILTER_OPTIONS: Array<BookingStatus | "all"> = [
	"all",
	"pending",
	"confirmed",
	"completed",
	"cancelled",
];

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const WEEKDAY_LONG_FORMAT = new Intl.DateTimeFormat("es-ES", {
	weekday: "long",
	day: "numeric",
	month: "long",
	year: "numeric",
});
const DAY_MONTH_FORMAT = new Intl.DateTimeFormat("es-ES", {
	day: "2-digit",
	month: "short",
});

function capitalize(text: string): string {
	if (!text) return "";
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function normalizeDate(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function parseIsoDate(isoDate: string): Date | null {
	if (!isoDate) return null;
	const [year, month, day] = isoDate.split("-").map(Number);
	if (!year || !month || !day) return null;
	return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function toIsoDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number): Date {
	const next = new Date(date);
	next.setDate(next.getDate() + amount);
	return normalizeDate(next);
}

function startOfWeek(date: Date): Date {
	const base = normalizeDate(date);
	const day = base.getDay();
	const offset = day === 0 ? -6 : 1 - day;
	return addDays(base, offset);
}

function weekDaysFrom(date: Date): Date[] {
	const start = startOfWeek(date);
	return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function shortTime(timeValue: string): string {
	return (timeValue || "").slice(0, 5);
}

function statusLabel(status: BookingStatus | "all"): string {
	if (!status || status === "all") return "Todos";
	return STATUS_META[status]?.label ?? status;
}

function sortBookings(list: Booking[]): Booking[] {
	return [...list].sort((a, b) => {
		const aKey = `${a.booking_date}T${a.start_time}`;
		const bKey = `${b.booking_date}T${b.start_time}`;
		return aKey.localeCompare(bKey);
	});
}

function listToLookup<T extends { id: string }>(list: T[]): Record<string, T> {
	return list.reduce<Record<string, T>>((acc, item) => {
		acc[item.id] = item;
		return acc;
	}, {});
}

interface BookingAction {
	to: BookingStatusUpdate;
	label: string;
	className: string;
}

function getBookingActions(status: BookingStatus): BookingAction[] {
	if (status === "pending") {
		return [
			{ to: "confirmed", label: "Confirmar", className: "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-200 dark:hover:bg-emerald-400/10" },
			{ to: "cancelled", label: "Cancelar", className: "border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-200 dark:hover:bg-rose-400/10" },
		];
	}
	if (status === "confirmed") {
		return [
			{ to: "completed", label: "Completar", className: "border-sky-300 text-sky-700 hover:bg-sky-50 dark:border-sky-500/40 dark:text-sky-200 dark:hover:bg-sky-400/10" },
			{ to: "cancelled", label: "Cancelar", className: "border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-200 dark:hover:bg-rose-400/10" },
		];
	}
	return [];
}

interface BookingCardProps {
	booking: Booking;
	serviceName: string;
	staffName: string;
	compact?: boolean;
	onStatusChange: (bookingId: string, nextStatus: BookingStatusUpdate) => void;
	isUpdating: boolean;
}

function BookingCard({
	booking,
	serviceName,
	staffName,
	compact = false,
	onStatusChange,
	isUpdating,
}: BookingCardProps) {
	const meta = STATUS_META[booking.status] ?? STATUS_META.pending;
	const actions = getBookingActions(booking.status);

	return (
		<article
			className={`rounded-2xl border border-zinc-200/80 bg-white/95 p-3 shadow-[0_10px_20px_-15px_rgba(0,0,0,0.35)] dark:border-zinc-800 dark:bg-zinc-900 ${compact ? "" : "md:p-4"}`}
		>
			<div className="mb-3 flex items-start justify-between gap-2">
				<div>
					<p className={`font-semibold text-zinc-900 dark:text-white ${compact ? "text-sm" : "text-base"}`}>
						{shortTime(booking.start_time)} - {shortTime(booking.end_time)}
					</p>
					<p className={`text-zinc-500 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}>
						{serviceName}
					</p>
					<p className={`text-zinc-500 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}>
						Profesional: {staffName}
					</p>
				</div>
				<span
					className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.badge}`}
				>
					<span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
					{meta.label}
				</span>
			</div>

			{actions.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{actions.map((action) => (
						<button
							key={action.to}
							type="button"
							onClick={() => onStatusChange(booking.id, action.to)}
							disabled={isUpdating}
							className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${action.className}`}
						>
							{isUpdating ? "Actualizando..." : action.label}
						</button>
					))}
				</div>
			) : (
				<p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
					Sin acciones pendientes
				</p>
			)}
		</article>
	);
}

export default function AgendaPage() {
	const router = useRouter();

	const [user, setUser] = useState<User | null>(null);
	const [business, setBusiness] = useState<Business | null>(null);
	const [servicesById, setServicesById] = useState<Record<string, Service>>({});
	const [staffById, setStaffById] = useState<Record<string, Staff>>({});
	const [bookings, setBookings] = useState<Booking[]>([]);

	const [viewMode, setViewMode] = useState<"day" | "week">("day");
	const [focusDate, setFocusDate] = useState<Date>(normalizeDate(new Date()));
	const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
	const [staffFilter, setStaffFilter] = useState<string>("all");

	const [loadingSession, setLoadingSession] = useState<boolean>(true);
	const [loadingAgenda, setLoadingAgenda] = useState<boolean>(false);
	const [updatingBookingId, setUpdatingBookingId] = useState<string>("");

	const [sessionError, setSessionError] = useState<string>("");
	const [agendaError, setAgendaError] = useState<string>("");
	const [actionError, setActionError] = useState<string>("");

	useEffect(() => {
		let alive = true;

		async function loadSession(): Promise<void> {
			setLoadingSession(true);
			setSessionError("");

			try {
				const me = await getMe();
				if (!alive) return;

				if (me.role !== "business_owner") {
					router.push("/dashboard");
					return;
				}

				setUser(me);

				let ownedBusiness: Business | null = null;
				try {
					ownedBusiness = await getMyBusiness();
				} catch (error) {
					const detail = error instanceof Error ? error.message : "";
					if (detail !== "Business profile not created") {
						throw error;
					}
				}

				if (!alive) return;
				setBusiness(ownedBusiness);

				if (!ownedBusiness) {
					setServicesById({});
					setStaffById({});
					return;
				}

				const [services, staff] = await Promise.all([
					listServices(ownedBusiness.id),
					listStaff(ownedBusiness.id),
				]);

				if (!alive) return;

				setServicesById(listToLookup(services));
				setStaffById(listToLookup(staff));
			} catch (error) {
				if (!alive) return;
				setSessionError(error instanceof Error ? error.message : "No se pudo cargar la sesión.");
				router.push("/auth/login");
			} finally {
				if (alive) {
					setLoadingSession(false);
				}
			}
		}

		loadSession();

		return () => {
			alive = false;
		};
	}, [router]);

	const weekDays = useMemo<Date[]>(() => weekDaysFrom(focusDate), [focusDate]);
	const visibleDates = useMemo<Date[]>(() => {
		return viewMode === "week" ? weekDays : [focusDate];
	}, [viewMode, weekDays, focusDate]);
	const businessId = business?.id;

	useEffect(() => {
		if (!businessId) {
			setBookings([]);
			return;
		}

		let alive = true;

		async function loadAgenda(): Promise<void> {
			setLoadingAgenda(true);
			setAgendaError("");
			const activeBusinessId = businessId;
			if (!activeBusinessId) {
				setLoadingAgenda(false);
				return;
			}

			try {
				const responses = await Promise.all(
					visibleDates.map((date) => businessAgenda(activeBusinessId, toIsoDate(date)))
				);

				if (!alive) return;

				const merged = responses.flat();
				const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
				setBookings(sortBookings(uniqueById));
			} catch (error) {
				if (!alive) return;
				setAgendaError(error instanceof Error ? error.message : "No se pudo cargar la agenda.");
			} finally {
				if (alive) {
					setLoadingAgenda(false);
				}
			}
		}

		loadAgenda();

		return () => {
			alive = false;
		};
	}, [businessId, visibleDates]);

	const filteredBookings = useMemo<Booking[]>(() => {
		return bookings.filter((booking) => {
			const statusMatch = statusFilter === "all" || booking.status === statusFilter;
			const staffMatch = staffFilter === "all" || booking.staff_id === staffFilter;
			return statusMatch && staffMatch;
		});
	}, [bookings, statusFilter, staffFilter]);

	const focusDateKey = useMemo<string>(() => toIsoDate(focusDate), [focusDate]);
	const dayBookings = useMemo<Booking[]>(() => {
		return sortBookings(filteredBookings.filter((booking) => booking.booking_date === focusDateKey));
	}, [filteredBookings, focusDateKey]);

	const bookingsByHour = useMemo<Record<number, Booking[]>>(() => {
		return dayBookings.reduce<Record<number, Booking[]>>((acc, booking) => {
			const hour = Number(booking.start_time.slice(0, 2));
			if (!acc[hour]) acc[hour] = [];
			acc[hour].push(booking);
			return acc;
		}, {});
	}, [dayBookings]);

	const dayHourSlots = useMemo<number[]>(() => {
		if (dayBookings.length === 0) {
			return Array.from({ length: 12 }, (_, index) => index + 8);
		}

		let minHour = 23;
		let maxHour = 0;

		dayBookings.forEach((booking) => {
			const startHour = Number(booking.start_time.slice(0, 2));
			const endHour = Number(booking.end_time.slice(0, 2));
			minHour = Math.min(minHour, startHour);
			maxHour = Math.max(maxHour, endHour);
		});

		const from = Math.max(6, minHour - 1);
		const to = Math.min(22, maxHour + 1);

		return Array.from({ length: to - from + 1 }, (_, index) => from + index);
	}, [dayBookings]);

	const weekColumns = useMemo<Record<string, Booking[]>>(() => {
		const grouped = weekDays.reduce<Record<string, Booking[]>>((acc, date) => {
			acc[toIsoDate(date)] = [];
			return acc;
		}, {});

		filteredBookings.forEach((booking) => {
			if (!grouped[booking.booking_date]) return;
			grouped[booking.booking_date].push(booking);
		});

		Object.keys(grouped).forEach((key) => {
			grouped[key] = sortBookings(grouped[key]);
		});

		return grouped;
	}, [filteredBookings, weekDays]);

	const metrics = useMemo(() => {
		const total = filteredBookings.length;
		const pending = filteredBookings.filter((booking) => booking.status === "pending").length;
		const confirmed = filteredBookings.filter((booking) => booking.status === "confirmed").length;
		const completed = filteredBookings.filter((booking) => booking.status === "completed").length;
		const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

		return { total, pending, confirmed, completed, completionRate };
	}, [filteredBookings]);

	const staffOptions = useMemo<Staff[]>(() => {
		return Object.values(staffById).sort((a, b) => a.name.localeCompare(b.name));
	}, [staffById]);

	const dateLabel = useMemo<string>(() => {
		if (viewMode === "day") {
			return capitalize(WEEKDAY_LONG_FORMAT.format(focusDate));
		}

		const weekStart = weekDays[0];
		const weekEnd = weekDays[6];

		return `${capitalize(DAY_MONTH_FORMAT.format(weekStart))} - ${capitalize(
			DAY_MONTH_FORMAT.format(weekEnd)
		)}`;
	}, [viewMode, focusDate, weekDays]);

	const todayDateKey = useMemo<string>(() => toIsoDate(normalizeDate(new Date())), []);

	async function handleStatusChange(bookingId: string, nextStatus: BookingStatusUpdate): Promise<void> {
		setUpdatingBookingId(bookingId);
		setActionError("");

		try {
			const updated = await updateBookingStatus(bookingId, nextStatus);
			setBookings((current) =>
				sortBookings(current.map((booking) => (booking.id === bookingId ? updated : booking)))
			);
		} catch (error) {
			setActionError(
				error instanceof Error
					? error.message
					: "No se pudo actualizar el estado de la cita."
			);
		} finally {
			setUpdatingBookingId("");
		}
	}

	function moveWindow(step: number): void {
		const amount = viewMode === "week" ? step * 7 : step;
		setFocusDate((current) => addDays(current, amount));
	}

	function goToToday(): void {
		setFocusDate(normalizeDate(new Date()));
	}

	if (loadingSession) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/75">
				<div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-300" />
			</div>
		);
	}

	if (!user || user.role !== "business_owner") {
		return null;
	}

	if (!business) {
		return (
			<section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.18),transparent_45%),linear-gradient(180deg,#111827_0%,#09090b_100%)] px-4 py-8 sm:px-6 sm:py-10">
				<div className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-white/85 p-8 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.5)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
					<h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
						Todavia no tienes un negocio conectado
					</h1>
					<p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
						La agenda esta disponible exclusivamente para propietarios con negocio registrado.
					</p>
					{sessionError ? (
						<p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-400/10 dark:text-rose-200">
							{sessionError}
						</p>
					) : null}
					<div className="mt-6 flex flex-wrap gap-3">
						<Link
							href="/dashboard"
							className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
						>
							Volver al panel
						</Link>
						<Link
							href="/marketplace"
							className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
						>
							Explorar negocios
						</Link>
					</div>
				</div>
			</section>
		);
	}

	return (
		<div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.24)_0%,rgba(9,9,11,0.98)_38%,rgba(2,6,23,1)_100%)] pb-10">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(120deg,rgba(251,191,36,0.28),rgba(20,184,166,0.12),rgba(255,255,255,0))] dark:bg-[linear-gradient(120deg,rgba(20,184,166,0.2),rgba(15,23,42,0))]" />

			<div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-8 md:px-6">
				<section className="rounded-3xl border border-white/70 bg-white/88 p-6 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.65)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
					<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:border-amber-500/40 dark:bg-amber-400/10 dark:text-amber-200">
								Agenda Operativa
							</p>
							<h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
								{business.name}
							</h1>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								Administra citas diarias y semanales con control en tiempo real.
							</p>
						</div>

						<div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
							<div className="rounded-2xl border border-zinc-200/80 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950/60">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
									En rango
								</p>
								<p className="text-xl font-semibold text-zinc-900 dark:text-white">{metrics.total}</p>
							</div>
							<div className="rounded-2xl border border-zinc-200/80 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950/60">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
									Pendientes
								</p>
								<p className="text-xl font-semibold text-amber-600 dark:text-amber-300">
									{metrics.pending}
								</p>
							</div>
							<div className="rounded-2xl border border-zinc-200/80 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950/60">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
									Confirmadas
								</p>
								<p className="text-xl font-semibold text-emerald-600 dark:text-emerald-300">
									{metrics.confirmed}
								</p>
							</div>
							<div className="rounded-2xl border border-zinc-200/80 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950/60">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
									Completadas
								</p>
								<p className="text-xl font-semibold text-sky-600 dark:text-sky-300">
									{metrics.completionRate}%
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-3xl border border-zinc-200/80 bg-white/88 p-4 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 md:p-5">
					<div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
						<div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-950/50">
							<p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
								Navegacion
							</p>
							<div className="mt-2 flex flex-wrap items-center gap-2">
								<button
									type="button"
									onClick={() => moveWindow(-1)}
									className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
								>
									Anterior
								</button>
								<button
									type="button"
									onClick={goToToday}
									className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
								>
									Hoy
								</button>
								<button
									type="button"
									onClick={() => moveWindow(1)}
									className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
								>
									Siguiente
								</button>
							</div>
							<p className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{dateLabel}</p>
						</div>

						<div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-950/50">
							<p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Vista</p>
							<div className="mt-2 flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => setViewMode("day")}
									className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
										viewMode === "day"
											? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
											: "border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
									}`}
								>
									Dia
								</button>
								<button
									type="button"
									onClick={() => setViewMode("week")}
									className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
										viewMode === "week"
											? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
											: "border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
									}`}
								>
									Semana
								</button>
							</div>

							<input
								type="date"
								value={focusDateKey}
								onChange={(event) => {
									const parsed = parseIsoDate(event.target.value);
									if (parsed) setFocusDate(parsed);
								}}
								className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
							/>
						</div>

						<div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-950/50">
							<p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Filtros</p>
							<div className="mt-2 grid gap-2">
								<select
									value={statusFilter}
									onChange={(event) => setStatusFilter(event.target.value as BookingStatus | "all")}
									className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
								>
									{STATUS_FILTER_OPTIONS.map((status) => (
										<option key={status} value={status}>
											Estado: {statusLabel(status)}
										</option>
									))}
								</select>

								<select
									value={staffFilter}
									onChange={(event) => setStaffFilter(event.target.value)}
									className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
								>
									<option value="all">Profesional: Todos</option>
									{staffOptions.map((member) => (
										<option key={member.id} value={member.id}>
											{member.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</section>

				{agendaError ? (
					<p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
						{agendaError}
					</p>
				) : null}

				{actionError ? (
					<p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
						{actionError}
					</p>
				) : null}

				{loadingAgenda ? (
					<div className="flex h-56 items-center justify-center rounded-3xl border border-zinc-200/80 bg-white/85 dark:border-zinc-800 dark:bg-zinc-900/80">
						<div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
					</div>
				) : viewMode === "day" ? (
					<section className="grid gap-5 xl:grid-cols-[1.9fr_1fr]">
						<article className="rounded-3xl border border-zinc-200/80 bg-white/90 shadow-[0_25px_45px_-35px_rgba(0,0,0,0.6)] dark:border-zinc-800 dark:bg-zinc-900/85">
							<div className="border-b border-zinc-200/70 px-5 py-4 dark:border-zinc-800">
								<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Vista diaria</h2>
								<p className="text-sm text-zinc-500 dark:text-zinc-400">{capitalize(WEEKDAY_LONG_FORMAT.format(focusDate))}</p>
							</div>

							{dayBookings.length === 0 ? (
								<div className="px-5 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
									No hay citas para este dia con los filtros actuales.
								</div>
							) : (
								<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
									{dayHourSlots.map((hour) => {
										const hourLabel = `${String(hour).padStart(2, "0")}:00`;
										const hourBookings = bookingsByHour[hour] ?? [];

										return (
											<div key={hour} className="grid gap-3 px-4 py-3 md:grid-cols-[72px_1fr]">
												<p className="pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
													{hourLabel}
												</p>
												<div className="space-y-2">
													{hourBookings.length === 0 ? (
														<div className="rounded-xl border border-dashed border-zinc-200 px-3 py-2 text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
															Sin cita
														</div>
													) : (
														hourBookings.map((booking) => (
															<BookingCard
																key={booking.id}
																booking={booking}
																serviceName={
																	servicesById[booking.service_id]?.name ??
																	`Servicio ${booking.service_id.slice(0, 6)}`
																}
																staffName={
																	staffById[booking.staff_id]?.name ??
																	`Staff ${booking.staff_id.slice(0, 6)}`
																}
																onStatusChange={handleStatusChange}
																isUpdating={updatingBookingId === booking.id}
															/>
														))
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</article>

						<aside className="space-y-5">
							<article className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_25px_45px_-35px_rgba(0,0,0,0.6)] dark:border-zinc-800 dark:bg-zinc-900/85">
								<h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
									Resumen del dia
								</h3>
								<div className="mt-3 space-y-2 text-sm">
									<div className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700">
										<span className="text-zinc-500">Total citas</span>
										<strong className="text-zinc-900 dark:text-white">{dayBookings.length}</strong>
									</div>
									<div className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700">
										<span className="text-zinc-500">Pendientes</span>
										<strong className="text-amber-600 dark:text-amber-300">
											{dayBookings.filter((booking) => booking.status === "pending").length}
										</strong>
									</div>
									<div className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700">
										<span className="text-zinc-500">Confirmadas</span>
										<strong className="text-emerald-600 dark:text-emerald-300">
											{dayBookings.filter((booking) => booking.status === "confirmed").length}
										</strong>
									</div>
									<div className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700">
										<span className="text-zinc-500">Completadas</span>
										<strong className="text-sky-600 dark:text-sky-300">
											{dayBookings.filter((booking) => booking.status === "completed").length}
										</strong>
									</div>
								</div>
							</article>

							<article className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_25px_45px_-35px_rgba(0,0,0,0.6)] dark:border-zinc-800 dark:bg-zinc-900/85">
								<h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
									Pendientes de accion
								</h3>
								<div className="mt-3 space-y-2">
									{dayBookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed")
										.length === 0 ? (
										<p className="rounded-xl border border-dashed border-zinc-200 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
											Todo en orden para hoy.
										</p>
									) : (
										dayBookings
											.filter((booking) => booking.status === "pending" || booking.status === "confirmed")
											.slice(0, 6)
											.map((booking) => (
												<div
													key={booking.id}
													className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700"
												>
													<div>
														<p className="text-sm font-semibold text-zinc-900 dark:text-white">
															{shortTime(booking.start_time)} · {staffById[booking.staff_id]?.name ?? "Staff"}
														</p>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															{servicesById[booking.service_id]?.name ?? "Servicio"}
														</p>
													</div>
													<span
														className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
															STATUS_META[booking.status]?.badge ?? ""
														}`}
													>
														{STATUS_META[booking.status]?.label ?? booking.status}
													</span>
												</div>
											))
									)}
								</div>
							</article>
						</aside>
					</section>
				) : (
					<section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-4 shadow-[0_25px_45px_-35px_rgba(0,0,0,0.6)] dark:border-zinc-800 dark:bg-zinc-900/85 md:p-5">
						<header className="mb-4">
							<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Vista semanal</h2>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								Haz clic en un dia para abrirlo en detalle.
							</p>
						</header>

						<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
							{weekDays.map((day) => {
								const dayKey = toIsoDate(day);
								const columnBookings = weekColumns[dayKey] ?? [];
								const isToday = dayKey === todayDateKey;

								return (
									<article
										key={dayKey}
										className={`rounded-2xl border p-3 ${
											isToday
												? "border-amber-300 bg-amber-50/60 dark:border-amber-500/50 dark:bg-amber-400/10"
												: "border-zinc-200 bg-zinc-50/70 dark:border-zinc-700 dark:bg-zinc-950/45"
										}`}
									>
										<button
											type="button"
											onClick={() => {
												setFocusDate(day);
												setViewMode("day");
											}}
											className="w-full rounded-xl border border-transparent px-2 py-1 text-left transition hover:border-zinc-300 hover:bg-white/70 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
										>
											<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
												{capitalize(WEEKDAY_FORMAT.format(day))}
											</p>
											<p className="text-lg font-semibold text-zinc-900 dark:text-white">{day.getDate()}</p>
										</button>

										<div className="my-2 h-px w-full bg-zinc-200 dark:bg-zinc-700" />

										<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
											{columnBookings.length} cita{columnBookings.length === 1 ? "" : "s"}
										</p>

										<div className="space-y-2">
											{columnBookings.length === 0 ? (
												<div className="rounded-xl border border-dashed border-zinc-200 px-2 py-2 text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
													Libre
												</div>
											) : (
												columnBookings.map((booking) => (
													<BookingCard
														key={booking.id}
														booking={booking}
														compact
														serviceName={
															servicesById[booking.service_id]?.name ??
															`Servicio ${booking.service_id.slice(0, 6)}`
														}
														staffName={
															staffById[booking.staff_id]?.name ??
															`Staff ${booking.staff_id.slice(0, 6)}`
														}
														onStatusChange={handleStatusChange}
														isUpdating={updatingBookingId === booking.id}
													/>
												))
											)}
										</div>
									</article>
								);
							})}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
