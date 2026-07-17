"use client"

import type { ComponentType } from "react"
import { Pie, PieChart } from "recharts"

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
import Tooltip from "@/components/ui/Tooltip"

export interface PaymentMethodItem {
  id: string
  label: string
  val: number
  icon: ComponentType<{ className?: string }>
}

export interface ChartPieLegendProps {
  data: PaymentMethodItem[]
  title?: string
  description?: string
  formatValue?: (value: number) => string
}

const PAYMENT_COLORS: Record<string, string> = {
  cash: "var(--color-pending)",
  credit_card: "var(--app-primary)",
  transfer: "var(--color-info)",
  online: "var(--color-success)",
}

const defaultFormatValue = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const buildChartConfig = (data: PaymentMethodItem[]) => {
  const config: ChartConfig = {
    value: {
      label: "Monto",
    },
  }

  data.forEach((item) => {
    config[item.id] = {
      label: item.label,
      color: PAYMENT_COLORS[item.id] ?? "var(--text-muted)",
    }
  })

  return config
}

const formatPercent = (value: number) => `${Math.round(value * 10) / 10}%`

export function ChartPieLegend({
  data,
  title = "Métodos de Pago",
  formatValue = defaultFormatValue,
}: ChartPieLegendProps) {
  const total = data.reduce((sum, item) => sum + item.val, 0)
  const activeItems = data.filter((item) => item.val > 0)
  const dominantMethod = activeItems.reduce<PaymentMethodItem | null>(
    (best, item) => (best === null || item.val > best.val ? item : best),
    null
  )

  const chartConfig = buildChartConfig(data)

  const chartData = data.map((item) => ({
    name: item.id,
    label: item.label,
    value: item.val,
    fill: PAYMENT_COLORS[item.id] ?? "var(--text-muted)",
    icon: item.icon,
  }))

  return (
    <Card className="flex flex-col lg:h-[260px] min-h-0">
      <CardHeader className="items-left pb-0 pt-3.5 px-4 shrink-0 text-left">
        <CardTitle className="text-sm sm:text-[15px] font-bold text-[var(--text-primary)]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-1 pt-2 px-3 sm:px-4 flex min-h-0 flex-col gap-2.5">
        {total === 0 ? (
          <div className="flex w-full items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-6 text-center text-xs text-[var(--text-muted)]">
            No hay pagos registrados para este período.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center min-h-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto w-full aspect-square max-h-[166px] sm:max-h-[172px]"
              >
                <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        nameKey="name"
                        hideLabel={false}
                        formatter={(value, name) => {
                          const methodKey = typeof name === "string" ? name : "value"
                          const methodLabel = chartConfig[methodKey]?.label || methodKey
                          const amount = Number(value ?? 0)
                          const percentage = total > 0 ? (amount / total) * 100 : 0

                          return (
                            <div className="flex w-full items-center justify-between gap-4">
                              <span className="text-[var(--text-muted)]">{String(methodLabel)}</span>
                              <span className="font-medium text-[var(--text-primary)]">
                                {formatValue(amount)} · {formatPercent(percentage)}
                              </span>
                            </div>
                          )
                        }}
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="92%"
                    strokeWidth={2}
                    stroke="var(--surface-3)"
                    labelLine={false}
                  />
                </PieChart>
              </ChartContainer>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
              {chartData.map((item) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0
                const Icon = item.icon

                return (
                  <Tooltip
                    key={item.name}
                    content={`${item.label} · ${formatPercent(percentage)}`}
                    className="group relative min-w-0 rounded-[var(--radius-lg)] px-2 py-2 text-center transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <div className="flex min-w-0 flex-col items-center gap-1.5">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--surface-3)] shadow-[var(--shadow-sm)] transition-transform group-hover:scale-105"
                        style={{ backgroundColor: item.fill }}
                      >
                        <Icon className="h-3 w-3" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold leading-tight text-[var(--text-primary)]">
                          {formatValue(item.value)}
                        </p>

                      </div>
                    </div>
                  </Tooltip>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
