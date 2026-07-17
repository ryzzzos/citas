import * as React from "react"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import AppIcon from "@/components/ui/AppIcon"
import { NumberTicker } from "@/components/ui/NumberTicker"
import Tooltip from "@/components/ui/Tooltip"

export interface KpiCardProps {
  title: string
  value: string | number
  previousValue?: number // Optional: used to calculate progress bar automatically
  icon: LucideIcon
  iconBgClass: string
  
  // Dynamic Trend options
  trendDelta?: number
  trendInvert?: boolean
  trendPct?: number
  trendColorClass?: string
  
  // Progress Bar options
  showProgressBar?: boolean
  barColorClass?: string
  period?: string // "week" | "month" | "year"
  
  // Tooltip options
  tooltipText?: string
  tooltipTarget?: "title" | "bar"
  
  // Custom options
  animateNumber?: boolean
}

export function KpiCard({
  title,
  value,
  previousValue,
  icon,
  iconBgClass,
  trendDelta,
  trendInvert = false,
  trendPct,
  trendColorClass,
  showProgressBar = false,
  barColorClass = "bg-[var(--text-primary)]",
  period,
  tooltipText,
  tooltipTarget,
  animateNumber = true,
}: KpiCardProps) {
  
  // Determine standard trend icon dynamically based on percentage/delta value
  const trendValue = trendDelta !== undefined ? trendDelta : (trendPct !== undefined ? trendPct : 0)
  const isPositive = trendValue > 0
  const isNegative = trendValue < 0
  const isNeutral = trendValue === 0

  const calculatedTrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus

  // Determine trend color dynamically
  const calculatedTrendColorClass = (() => {
    if (trendColorClass) return trendColorClass
    if (isNeutral) return "text-[var(--text-muted)]"
    const isGood = trendInvert ? !isPositive : isPositive
    return isGood ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
  })()

  // Automatically calculate barValue internally
  const barValue = (() => {
    if (!showProgressBar) return 0

    if (previousValue !== undefined) {
      const currentValueNum = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ""))
      if (isNaN(currentValueNum)) return 0
      return previousValue > 0 
        ? Math.min(100, Math.round((currentValueNum / previousValue) * 100)) 
        : (currentValueNum > 0 ? 100 : 0)
    }

    if (trendDelta !== undefined) {
      return Math.min(100, Math.max(0, 100 + trendDelta))
    }

    if (trendPct !== undefined) {
      return Math.min(100, Math.max(0, trendPct))
    }

    return 0
  })()

  // Automatically generate dynamic tooltip text for the bottom progress bar
  const generatedBarTooltipText = (() => {
    if (!showProgressBar) return undefined

    const periodLabel = period === "week" ? "esta semana" : period === "month" ? "este mes" : period === "year" ? "este año" : "este periodo"
    const prevPeriodLabel = period === "week" ? "la semana anterior" : period === "month" ? "el mes anterior" : period === "year" ? "el año anterior" : "el periodo anterior"

    if (previousValue !== undefined) {
      if (title.toLowerCase() === "reservas") {
        return `Volumen total de citas ${periodLabel} vs. ${prevPeriodLabel} (Meta: ${previousValue} citas).`
      }
      return `Citas ${title.toLowerCase()} ${periodLabel} vs. ${prevPeriodLabel} (${value} vs. ${previousValue}).`
    }

    if (trendDelta !== undefined) {
      const currentValueNum = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ""))
      if (!isNaN(currentValueNum)) {
        const prevVal = trendDelta === -100 ? 0 : Math.round(currentValueNum / (1 + trendDelta / 100))
        const isQty = title.toLowerCase().includes("clientes")
        const formatCLP = (val: number) => {
          return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
          }).format(val)
        }
        const prevStr = isQty ? String(prevVal) : formatCLP(prevVal)
        return `${title} de ${periodLabel} vs. ${prevPeriodLabel} (${value} vs. ${prevStr}).`
      }
    }

    return undefined
  })()

  const renderAnimatedValue = () => {
    if (!animateNumber) return value

    if (typeof value === "number") {
      return <NumberTicker value={value} />
    }

    const stringValue = String(value)
    const match = stringValue.match(/\d[\d,]*(?:\.\d+)?/)

    if (!match || match.index === undefined) {
      return value
    }

    const numericToken = match[0]
    const numericValue = Number(numericToken.replace(/,/g, ""))

    if (Number.isNaN(numericValue)) {
      return value
    }

    const decimalPlaces = numericToken.includes(".")
      ? numericToken.split(".")[1].length
      : 0

    const prefix = stringValue.slice(0, match.index)
    const suffix = stringValue.slice(match.index + numericToken.length)

    return (
      <>
        {prefix}
        <NumberTicker value={numericValue} decimalPlaces={decimalPlaces} />
        {suffix}
      </>
    )
  }

  return (
    <article className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        
        {/* Left Side: Icon & Title (with hover tooltip) */}
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBgClass}`}>
            <AppIcon icon={icon} size="md" />
          </div>
          {tooltipTarget === "title" && tooltipText ? (
            <Tooltip
              content={tooltipText}
              className="relative"
              tooltipClassName="max-w-[12rem] whitespace-normal text-center text-[10px] leading-relaxed font-semibold text-[var(--text-secondary)]"
            >
              <p className="cursor-help border-b border-dashed border-[var(--border-strong)]/60 pb-0.5 text-[14px] sm:text-[15px] font-bold text-[var(--text-secondary)]">
                {title}
              </p>
            </Tooltip>
          ) : (
            <p className="text-[14px] sm:text-[15px] font-bold text-[var(--text-secondary)]">
              {title}
            </p>
          )}
        </div>

        {/* Right Side: Trend percentage */}
        {(trendDelta !== undefined || trendPct !== undefined) && (
          <div className={`flex items-center gap-1 text-sm font-bold shrink-0 ${calculatedTrendColorClass}`}>
            <AppIcon icon={calculatedTrendIcon} size="md" className="h-4 w-4" />
            <span>
              {animateNumber ? (
                <NumberTicker value={Math.abs(trendValue)} />
              ) : (
                `${trendValue > 0 ? "+" : ""}${trendValue}`
              )}
              %
            </span>
          </div>
        )}
      </div>

      {/* Card Content & Progress Bar */}
      <div className="mt-4">
        <p className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {renderAnimatedValue()}
        </p>

        {showProgressBar && (
          <div className="mt-2.5">
            {generatedBarTooltipText ? (
              <Tooltip
                content={generatedBarTooltipText}
                className="relative block"
                tooltipClassName="max-w-[12rem] whitespace-normal text-center text-[11px] leading-snug font-medium text-[var(--text-secondary)]"
              >
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-1)] cursor-help">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full ${barColorClass}`}
                    style={{ width: `${barValue}%` }}
                  />
                </div>
              </Tooltip>
            ) : (
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-1)] cursor-help">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${barColorClass}`}
                  style={{ width: `${barValue}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
