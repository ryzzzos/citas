"use client";

import { useEffect, useState } from "react";
import { 
  Wallet, TrendingDown, DollarSign, Users, ShieldAlert,
  CreditCard, Coins, ArrowRightLeft, Globe, Award, Sparkles
} from "lucide-react";
import { getBusinessBalance, getMyBusiness, type BalanceResponse } from "@/lib/api";
import type { Business } from "@/types";
import { useBranchContext } from "@/contexts/BranchContext";
import SegmentedControl from "@/components/ui/SegmentedControl";
import AppIcon from "@/components/ui/AppIcon";

function TrendBadge({ delta, invert = false }: { delta: number; invert?: boolean }) {
  const isPositive = delta >= 0;
  const isGood = invert ? !isPositive : isPositive;
  const label = `${isPositive ? "+" : ""}${delta}%`;
  const icon = isPositive ? "↑" : "↓";
  
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-muted)]">
        0%
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-bold ${
      isGood 
        ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/15" 
        : "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/15"
    }`}>
      {icon} {label}
    </span>
  );
}

export default function BalancePage() {
  const { activeBranch } = useBranchContext();
  const [business, setBusiness] = useState<Business | null>(null);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [period, setPeriod] = useState<string>("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          branch_id: activeBranch?.id || null,
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

  const totalPayments = paymentMethods.reduce((sum, item) => sum + item.val, 0) || 1;
  const maxPaymentVal = Math.max(...paymentMethods.map(item => item.val), 1);

  return (
    <div className="flex flex-col h-full space-y-6 lg:space-y-8 p-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Balance Financiero
          </h2>
          <p className="text-xs sm:text-[13.5px] text-[var(--text-secondary)] mt-0.5 font-medium">
            Monitorea los ingresos, estimaciones de gastos y comisiones de la empresa para{" "}
            <span className="text-[var(--text-primary)] font-semibold">
              {activeBranch ? activeBranch.name : "todas las sedes"}
            </span>.
          </p>
        </div>

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
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
        {/* KPI 1: Ingresos Brutos */}
        <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary)] text-[var(--surface-3)]">
                <AppIcon icon={Wallet} size="md" />
              </div>
              <p className="text-[14px] font-bold text-[var(--text-secondary)]">Ingresos Brutos</p>
            </div>
            <TrendBadge delta={balance.gross_income.delta} />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {formatCurrency(balance.gross_income.value)}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
              Ventas y reservas pagadas
            </p>
          </div>
        </article>

        {/* KPI 2: Gastos Totales */}
        <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-error)] text-[var(--surface-3)]">
                <AppIcon icon={TrendingDown} size="md" />
              </div>
              <p className="text-[14px] font-bold text-[var(--text-secondary)]">Gastos Totales</p>
            </div>
            {/* Invert delta badge color: spending increase is alert, decrease is success */}
            <TrendBadge delta={balance.expenses.delta} invert={true} />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {formatCurrency(balance.expenses.value)}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
              Comisiones estimadas de staff (30%)
            </p>
          </div>
        </article>

        {/* KPI 3: Ganancia Neta */}
        <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-success)] text-[var(--surface-3)]">
                <AppIcon icon={DollarSign} size="md" />
              </div>
              <p className="text-[14px] font-bold text-[var(--text-secondary)]">Ganancia Neta</p>
            </div>
            <TrendBadge delta={balance.net_profit.delta} />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {formatCurrency(balance.net_profit.value)}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
              Ingresos menos gastos estimados
            </p>
          </div>
        </article>

        {/* KPI 4: Nuevos Clientes */}
        <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-info)] text-[var(--surface-3)]">
                <AppIcon icon={Users} size="md" />
              </div>
              <p className="text-[14px] font-bold text-[var(--text-secondary)]">Nuevos Clientes</p>
            </div>
            <TrendBadge delta={balance.new_customers.delta} />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {balance.new_customers.value}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
              Clientes que agendaron por primera vez
            </p>
          </div>
        </article>
      </section>

      {/* Charts & Breakdown Details */}
      <section className="grid gap-6 md:grid-cols-2 shrink-0">
        {/* Left Column: Payments Breakdown */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-6 shadow-[var(--shadow-sm)]">
          <div className="mb-4">
            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Métodos de Pago</h3>
            <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 font-medium">
              Desglose de facturación por canal de pago
            </p>
          </div>

          <div className="space-y-4.5 mt-5">
            {paymentMethods.map(item => {
              const pctOfTotal = Math.round((item.val / totalPayments) * 100);
              const barWidthPct = Math.round((item.val / maxPaymentVal) * 100);
              const ItemIcon = item.icon;

              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
                      <AppIcon icon={ItemIcon} className="text-[var(--text-muted)] h-4 w-4 shrink-0" />
                      {item.label}
                    </span>
                    <span className="text-[var(--text-primary)] font-bold">
                      {formatCurrency(item.val)} <span className="text-[var(--text-muted)] font-medium">({pctOfTotal}%)</span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--app-primary)] rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${barWidthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Most profitable services */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-6 shadow-[var(--shadow-sm)]">
          <div className="mb-4">
            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Servicios Más Populares</h3>
            <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 font-medium">
              Top servicios ordenados por ingresos generados
            </p>
          </div>

          <div className="space-y-3.5 mt-5">
            {balance.profitable_services.length === 0 ? (
              <div className="text-center py-8 text-xs font-medium text-[var(--text-muted)]">
                No hay servicios registrados en este período.
              </div>
            ) : (
              balance.profitable_services.map((item, idx) => (
                <div 
                  key={item.name} 
                  className="flex items-center gap-3.5 p-2.5 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)]"
                >
                  <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {item.bookings_count} citas completadas
                    </p>
                  </div>
                  <div className="shrink-0 text-right font-bold text-xs text-[var(--text-primary)]">
                    {formatCurrency(item.income)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Staff commissions table */}
      <section className="flex-1 min-h-0 flex flex-col rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-6 shadow-[var(--shadow-sm)]">
        <div className="mb-4 shrink-0">
          <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Liquidación de Staff</h3>
          <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 font-medium">
            Comisiones acumuladas del personal por servicios completados (Coeficiente de MVP del 30%)
          </p>
        </div>

        <div className="flex-1 overflow-x-auto min-h-0 mt-3 scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Colaborador</th>
                <th className="pb-3 text-center">Citas Completadas</th>
                <th className="pb-3 text-right">Ingresos Totales</th>
                <th className="pb-3 text-right">Comisión (30%)</th>
                <th className="pb-3 text-right pr-2">Estado de Liquidación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-strong)]/45">
              {balance.staff_commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-muted)] font-medium">
                    <AppIcon icon={Award} className="mx-auto mb-2 text-[var(--text-muted)] opacity-50" />
                    No hay comisiones registradas para este período.
                  </td>
                </tr>
              ) : (
                balance.staff_commissions.map((item) => (
                  <tr key={item.staff_id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-[var(--text-primary)]">
                      {item.staff_name}
                    </td>
                    <td className="py-3.5 text-center font-semibold text-[var(--text-secondary)]">
                      {item.bookings_count}
                    </td>
                    <td className="py-3.5 text-right font-bold text-[var(--text-primary)]">
                      {formatCurrency(item.income)}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-[var(--app-primary)]">
                      {formatCurrency(item.commission)}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-pending)] bg-[var(--color-pending)]/12">
                        Pendiente de Pago
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
