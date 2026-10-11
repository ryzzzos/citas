"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import AppIcon from "@/components/ui/AppIcon"
import CustomSelect from "@/components/ui/CustomSelect"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface ChartBarMultipleProps {
  period: string
  chartRange?: string
  onRangeChange?: (range: string) => void
  grossIncome?: number
  trendDelta?: number
  chartData?: { label: string; sales: number }[]
}

const chartConfig = {
  sales: {
    label: "Ventas",
    color: "var(--app-primary)",
  },
} satisfies ChartConfig

const RANGE_LABELS: Record<string, Record<string, string>> = {
  week: {
    current: "Esta semana",
    last2: "Últimas 2 semanas",
    last3: "Últimas 3 semanas",
  },
  month: {
    current: "Este mes",
    last2: "Últimos 2 meses",
    last3: "Últimos 3 meses",
  },
  year: {
    current: "Este año",
    last2: "Últimos 2 años",
    last3: "Últimos 3 años",
  },
}

export function ChartBarMultiple({
  period,
  chartRange = "current",
  onRangeChange,
  grossIncome: _grossIncome,
  trendDelta = 0,
  chartData,
}: ChartBarMultipleProps) {
  const trendValue = trendDelta
  const isPositive = trendValue > 0
  const isNegative = trendValue < 0

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
  const trendColorClass = isPositive
    ? "text-[var(--color-success)]"
    : isNegative
    ? "text-[var(--color-error)]"
    : "text-[var(--text-muted)]"
  const trendSign = isPositive ? "+" : ""
  const trendFormatted = `${trendSign}${trendValue}%`

  const periodLabel =
    period === "week"
      ? "la semana anterior"
      : period === "year"
      ? "el año anterior"
      : "el mes anterior"
  const tooltipText = `Ventas un ${Math.abs(trendValue)}% ${
    isPositive ? "superiores" : isNegative ? "inferiores" : "iguales"
  } a ${periodLabel}.`

  // Obtener etiquetas del rango para el periodo actual
  const periodRanges = RANGE_LABELS[period] || RANGE_LABELS.month

  const selectOptions = [
    { value: "current", label: periodRanges.current },
    { value: "last2", label: periodRanges.last2 },
    { value: "last3", label: periodRanges.last3 },
  ]

  // Usar datos reales del backend si están disponibles, o fallback coherente
  const displayChartData =
    chartData && chartData.length > 0
      ? chartData
      : (() => {
          if (period === "week") {
            const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
            return dayNames.map((day) => ({ label: day, sales: 0 }))
          } else if (period === "year") {
            const monthNames = [
              "Ene", "Feb", "Mar", "Abr", "May", "Jun",
              "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
            ]
            return monthNames.map((month) => ({ label: month, sales: 0 }))
          } else {
            const weekNames = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"]
            return weekNames.map((w) => ({ label: w, sales: 0 }))
          }
        })()

  // Dynamic barSize calculations based on period density
  const calculatedBarSize = (() => {
    if (chartRange === "last3") return 8
    if (chartRange === "last2") return 12
    if (period === "year") return 14
    if (period === "week") return 24
    return 32
  })()

  // Calcular intervalo de etiquetas del eje X para evitar colisiones
  const getXAxisInterval = () => {
    if (chartRange === "last3") {
      return period === "year" ? 3 : period === "week" ? 2 : 1
    }
    if (chartRange === "last2") {
      return period === "year" ? 2 : 1
    }
    return 0
  }

  // Format tick labels for the Left YAxis scale
  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
    return String(value)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-sm sm:text-[15px] font-bold text-[var(--text-primary)]">
            Rendimiento de Ventas
          </CardTitle>
        </div>

        {/* Top-Right Header Elements: inline Trend + CustomSelect Range Selector */}
        <div className="flex items-center gap-3.5">
          {/* Custom Tooltip Trend Percentage */}
          <div
            className={`group relative inline-flex items-center gap-1 text-sm font-bold ${trendColorClass} cursor-help pb-0.5`}
          >
            <AppIcon icon={TrendIcon} className="h-4 w-4" />
            <span>{trendFormatted}</span>

            {/* Hover Tooltip Box */}
            <div className="pointer-events-none absolute bottom-full right-0 mb-2.5 w-48 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-2 text-center text-[10px] leading-relaxed font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-md)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              {tooltipText}
            </div>
          </div>

          {/* Premium CustomSelect Range Dropdown */}
          <CustomSelect
            value={chartRange}
            options={selectOptions}
            onChange={(val) => onRangeChange?.(val)}
            variant="glass"
            size="sm"
            align="right"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3 pt-2">
        <ChartContainer config={chartConfig} className="h-[170px] w-full">
          <BarChart accessibilityLayer data={displayChartData}>
            <CartesianGrid
              vertical={false}
              stroke="var(--border-strong)"
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              className="fill-[var(--text-muted)] text-[10px] font-semibold"
              interval={getXAxisInterval()}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="fill-[var(--text-muted)] text-[10px] font-semibold"
              tickFormatter={formatYAxisTick}
              width={35}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="sales"
              fill="var(--color-sales)"
              radius={[10, 10, 10, 10]}
              barSize={calculatedBarSize}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
