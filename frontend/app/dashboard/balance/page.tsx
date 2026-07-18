"use client";

import { useEffect, useState } from "react";
import { 
  Wallet, TrendingDown, DollarSign, Users, ShieldAlert,
  CreditCard, Coins, ArrowRightLeft, Globe, Award, Sparkles,
  Copy, Check, Eye, Pencil, Trash, ArrowUpDown
} from "lucide-react";
import { getBusinessBalance, getMyBusiness, type BalanceResponse } from "@/lib/api";
import type { Business } from "@/types";
import { useBranchContext } from "@/contexts/BranchContext";
import SegmentedControl from "@/components/ui/SegmentedControl";
import AppIcon from "@/components/ui/AppIcon";
import { ChartBarMultiple } from "@/components/charts/ChartBarMultiple";
import { ChartPieLegend } from "@/components/charts/ChartPieLegend";
import { KpiCard } from "@/components/charts/KpiCard";
import { Table, type TableColumn } from "@/components/ui/Table";
import CustomSelect from "@/components/ui/CustomSelect";

const GRADIENTS = [
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-emerald-400 to-teal-600",
  "from-[var(--warm-start,var(--color-pending))] to-[var(--warm-end,var(--color-warnm))]",
  "from-blue-500 to-cyan-500",
];

const getGradient = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[idx];
};



export default function BalancePage() {
  const { activeBranch } = useBranchContext();
  const [business, setBusiness] = useState<Business | null>(null);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [period, setPeriod] = useState<string>("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [serviceSortBy, setServiceSortBy] = useState<"bookings" | "income">("bookings");

  useEffect(() => {
    async function loadBusiness() {
      try {
        const biz = await getMyBusiness();
        setBusiness(biz);
      } catch (err) {
        setError("Error al cargar la información del negocio");
        setLoading(false);
      }
    }
    loadBusiness();
  }, []);

  useEffect(() => {
    if (!business) return;

    async function loadBalance() {
      if (!business) return;
      try {
        setLoading(true);
        const data = await getBusinessBalance(business.id, {
          period,
          branch_id: activeBranch?.id || undefined,
        });
        setBalance(data);
        setError(null);
      } catch (err) {
        setError("Error al cargar las métricas financieras");
      } finally {
        setLoading(false);
      }
    }
    loadBalance();
  }, [business, period, activeBranch]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const periodOptions = [
    { value: "week", label: "Semana" },
    { value: "month", label: "Mes" },
    { value: "year", label: "Año" }
  ];

  if (loading && !balance) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <AppIcon icon={ShieldAlert} className="h-10 w-10 text-[var(--color-error)] mb-3" />
        <h4 className="text-base font-bold text-[var(--text-primary)]">Algo salió mal</h4>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">{error}</p>
      </div>
    );
  }

  if (!balance) return null;

  // Calculamos porcentajes y máximos de métodos de pago para barras
  const paymentMethods = [
    { id: "cash", label: "Efectivo", val: balance.payment_methods.cash, icon: Coins },
    { id: "credit_card", label: "Tarjeta de Crédito", val: balance.payment_methods.credit_card, icon: CreditCard },
    { id: "transfer", label: "Transferencia", val: balance.payment_methods.transfer, icon: ArrowRightLeft },
    { id: "online", label: "Pago Online", val: balance.payment_methods.online, icon: Globe },
  ];

  const popularServicesColumns: TableColumn<BalanceResponse["profitable_services"][number]>[] = [
    {
      id: "rank",
      header: "#",
      className: "w-10 shrink-0 pl-4 text-left",
      accessor: (_, idx) => (
        <div className="text-[12px] font-semibold tracking-tight text-[var(--text-muted)]">
          {idx + 1}.
        </div>
      ),
    },
    {
      id: "service",
      header: "Servicio",
      className: "pl-2 text-left",
      accessor: (item) => (
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold tracking-tight text-[var(--text-primary)]">
            {item.name}
          </p>
          <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
            {item.bookings_count} citas
          </p>
        </div>
      ),
    },
    {
      id: "income",
      header: "Ingresos",
      className: "pr-4 text-right",
      accessor: (item) => (
        <div className="text-[12px] sm:text-[13px] font-semibold tracking-tight text-[var(--text-primary)] tabular-nums text-right">
          {formatCurrency(item.income)}
        </div>
      ),
    },
  ];

  const staffColumns: TableColumn<BalanceResponse["staff_commissions"][number]>[] = [
    {
      id: "id",
      header: "Worker ID",
      accessor: (item) => {
        const isCopied = copiedId === item.staff_id;
        return (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[var(--text-primary)]">
            <span>#{item.staff_id.slice(0, 7)}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(item.staff_id);
                setCopiedId(item.staff_id);
                setTimeout(() => setCopiedId(null), 2000);
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Copiar ID completo"
            >
              <AppIcon icon={isCopied ? Check : Copy} className={`h-3 w-3 ${isCopied ? "text-[var(--color-success)]" : ""}`} />
            </button>
          </div>
        );
      },
    },
    {
      id: "member",
      header: "Member",
      accessor: (item) => {
        const gradient = getGradient(item.staff_id);
        return (
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full bg-gradient-to-tr ${gradient} shrink-0 shadow-sm`} />
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold text-[var(--text-primary)] leading-tight">
                {item.staff_name}
              </p>
              <p className="text-[9.5px] text-[var(--text-muted)] font-medium leading-tight mt-0.5 truncate max-w-[140px]" title={item.staff_email || "Sin correo"}>
                {item.staff_email || "Sin correo"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (item) => (
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold text-[var(--text-secondary)] leading-tight">
            {item.staff_phone || "Sin teléfono"}
          </p>
          <p className="text-[9.5px] text-[var(--text-muted)] font-medium leading-tight mt-0.5">
            {item.bookings_count} citas completadas
          </p>
        </div>
      ),
    },
    {
      id: "commission",
      header: "Commission",
      accessor: (item) => (
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold text-[var(--text-secondary)] leading-tight">
            {formatCurrency(item.commission)}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 leading-tight">
            <span className="inline-flex rounded-full px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-[var(--color-pending)] bg-[var(--color-pending)]/12">
              {item.status === "pending" ? "Pendiente" : item.status}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-full space-y-5 lg:space-y-6 p-1">
      {/* Page Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 shrink-0">
        {/* Period Selector */}
        <div className="self-start sm:self-auto">
          <SegmentedControl
            name="balance-period"
            value={period}
            onChange={setPeriod}
            options={periodOptions}
            width={90}
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
        <KpiCard
          title="Ingresos Brutos"
          value={formatCurrency(balance.gross_income.value)}
          icon={Wallet}
          iconBgClass="bg-[var(--app-primary)] text-[var(--surface-3)]"
          trendDelta={balance.gross_income.delta}
          tooltipText="Ventas y reservas pagadas"
          tooltipTarget="title"
          showProgressBar={true}
          barColorClass="bg-[var(--app-primary)]"
          period={period}
        />

        <KpiCard
          title="Gastos Totales"
          value={formatCurrency(balance.expenses.value)}
          icon={TrendingDown}
          iconBgClass="bg-[var(--color-error)] text-[var(--surface-3)]"
          trendDelta={balance.expenses.delta}
          trendInvert={true}
          tooltipText="Comisiones estimadas de staff (30%)"
          tooltipTarget="title"
          showProgressBar={true}
          barColorClass="bg-[var(--color-error)]"
          period={period}
        />

        <KpiCard
          title="Ganancia Neta"
          value={formatCurrency(balance.net_profit.value)}
          icon={DollarSign}
          iconBgClass="bg-[var(--color-success)] text-[var(--surface-3)]"
          trendDelta={balance.net_profit.delta}
          tooltipText="Ingresos menos gastos estimados"
          tooltipTarget="title"
          showProgressBar={true}
          barColorClass="bg-[var(--color-success)]"
          period={period}
        />

        <KpiCard
          title="Nuevos Clientes"
          value={balance.new_customers.value}
          icon={Users}
          iconBgClass="bg-[var(--color-info)] text-[var(--surface-3)]"
          trendDelta={balance.new_customers.delta}
          tooltipText="Clientes que agendaron por primera vez"
          tooltipTarget="title"
          showProgressBar={true}
          barColorClass="bg-[var(--color-info)]"
          period={period}
        />
      </section>

      {/* Charts & Breakdown Details */}
      <section className="grid gap-4 lg:gap-5 grid-cols-1 lg:grid-cols-4 shrink-0">
        {/* Left Column: Multiple Bar Chart (takes 2/4 columns on desktop) */}
        <div className="lg:col-span-2">
          <ChartBarMultiple
            period={period}
            grossIncome={balance.gross_income.value}
            trendDelta={balance.gross_income.delta}
          />
        </div>

        {/* Middle Column: Most profitable services (takes 1/4 columns on desktop) */}
        <div className="flex flex-col lg:h-[260px] min-h-0">
          <div className="mb-2 shrink-0 flex items-center justify-between gap-2">
            <h3 className="text-[15px] sm:text-[16px] font-bold tracking-tight text-[var(--text-primary)] truncate">
              Servicios Populares
            </h3>
            <CustomSelect
              value={serviceSortBy}
              options={[
                { value: "bookings", label: "Por Citas" },
                { value: "income", label: "Por Facturación" },
              ]}
              onChange={setServiceSortBy}
              icon={ArrowUpDown}
              variant="glass"
              size="sm"
              align="right"
            />
          </div>

          <Table
            data={[...balance.profitable_services]
              .sort((a, b) => (serviceSortBy === "bookings" ? b.bookings_count - a.bookings_count : b.income - a.income))
              .slice(0, 6)}
            columns={popularServicesColumns}
            gridColsClass="grid-cols-[auto_1fr_auto]"
            keyExtractor={(item) => item.name}
            emptyStateMessage="No hay servicios registrados en este período."
            showActions={false}
            containerClassName="flex-1 min-h-0 flex flex-col"
            innerContainerClassName="overflow-y-auto hide-scrollbar"
            minWidthClass="min-w-0"
          />
        </div>

        {/* Right Column: Pie Chart with Legend Payment Methods (takes 1/4 columns on desktop) */}
        <ChartPieLegend data={paymentMethods} formatValue={formatCurrency} />
      </section>

      {/* Staff commissions table */}
      <section className="flex-1 min-h-0 flex flex-col">
        <div className="mb-2 shrink-0">
          <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Liquidación de Staff</h3>
        </div>
        <Table
          data={balance.staff_commissions}
          columns={staffColumns}
          gridColsClass="grid-cols-[1.2fr_2fr_1.8fr_1.8fr_1.2fr]"
          keyExtractor={(item) => item.staff_id}
          emptyStateMessage="No hay comisiones registradas para este período."
          emptyStateIcon={Award}
          showActions={true}
          renderActions={(item) => (
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                title="Ver detalles"
              >
                <AppIcon icon={Eye} className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--color-info)]/10 hover:text-[var(--color-info)] transition-all cursor-pointer"
                title="Editar liquidación"
              >
                <AppIcon icon={Pencil} className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-full text-[var(--color-error)]/70 hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-all cursor-pointer"
                title="Eliminar registro"
              >
                <AppIcon icon={Trash} className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          minWidthClass="min-w-[700px]"
        />
      </section>
    </div>
  );
}
