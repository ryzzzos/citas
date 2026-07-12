"use client"

import { useState, useRef, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import AppIcon from "@/components/ui/AppIcon"
import {
  Card,
  CardContent,
  CardDescription,
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
  grossIncome: number
}

const chartConfig = {
  desktop: {
    label: "Plataforma Web",
    color: "var(--app-primary)",
  },
  mobile: {
    label: "Plataforma Móvil",
    color: "var(--color-pending)",
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
  grossIncome,
}: ChartBarMultipleProps) {
  const [range, setRange] = useState<"current" | "last2" | "last3">("current")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [prevPeriod, setPrevPeriod] = useState(period)
  if (period !== prevPeriod) {
    setPrevPeriod(period)
    setRange("current")
  }

  // Cerrar el dropdown al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Obtener etiquetas del periodo actual
  const periodRanges = RANGE_LABELS[period] || RANGE_LABELS.month

  // Generar datos dinámicos basados en la facturación y el rango
  const chartData = (() => {
    const scaleFactor = range === "last2" ? 1.9 : range === "last3" ? 2.8 : 1.0
    const activeGross = grossIncome * scaleFactor

    if (period === "week") {
      const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
      const distribution = [0.10, 0.12, 0.15, 0.13, 0.18, 0.22, 0.10]
      
      if (range === "last2") {
        // 14 days representing last 2 weeks (dates)
        const data = []
        const today = new Date()
        const mondayLastWeek = new Date(today)
        const currentDay = today.getDay()
        const daysToSubtract = (currentDay === 0 ? 6 : currentDay - 1) + 7
        mondayLastWeek.setDate(today.getDate() - daysToSubtract)
        
        for (let i = 0; i < 14; i++) {
          const d = new Date(mondayLastWeek)
          d.setDate(mondayLastWeek.getDate() + i)
          const dayIdx = i % 7
          const val = (activeGross / 2) * distribution[dayIdx]
          const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
          data.push({
            label,
            desktop: Math.round(val * 0.75),
            mobile: Math.round(val * 0.25),
          })
        }
        return data
      } else if (range === "last3") {
        // 21 days representing last 3 weeks
        const data = []
        const today = new Date()
        const mondayTwoWeeksAgo = new Date(today)
        const currentDay = today.getDay()
        const daysToSubtract = (currentDay === 0 ? 6 : currentDay - 1) + 14
        mondayTwoWeeksAgo.setDate(today.getDate() - daysToSubtract)
        
        for (let i = 0; i < 21; i++) {
          const d = new Date(mondayTwoWeeksAgo)
          d.setDate(mondayTwoWeeksAgo.getDate() + i)
          const dayIdx = i % 7
          const val = (activeGross / 3) * distribution[dayIdx]
          const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
          data.push({
            label,
            desktop: Math.round(val * 0.75),
            mobile: Math.round(val * 0.25),
          })
        }
        return data
      } else {
        // 7 days (current week)
        return dayNames.map((day, i) => {
          const val = activeGross * distribution[i]
          return {
            label: day,
            desktop: Math.round(val * 0.75),
            mobile: Math.round(val * 0.25),
          }
        })
      }
    } else if (period === "year") {
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const distribution = [0.06, 0.08, 0.07, 0.09, 0.11, 0.12, 0.08, 0.07, 0.09, 0.08, 0.08, 0.07]
      
      const currentYear = new Date().getFullYear()
      const currentYearSuffix = String(currentYear).slice(-2)
      const prevYearSuffix = String(currentYear - 1).slice(-2)
      const prev2YearSuffix = String(currentYear - 2).slice(-2)

      if (range === "last2") {
        const data = []
        // Year 1 (Previous)
        for (let m = 0; m < 12; m++) {
          const val = (activeGross / 2) * distribution[m]
          data.push({
            label: `${monthNames[m]} '${prevYearSuffix}`,
            desktop: Math.round(val * 0.70),
            mobile: Math.round(val * 0.30),
          })
        }
        // Year 2 (Current)
        for (let m = 0; m < 12; m++) {
          const val = (activeGross / 2) * distribution[m]
          data.push({
            label: `${monthNames[m]} '${currentYearSuffix}`,
            desktop: Math.round(val * 0.70),
            mobile: Math.round(val * 0.30),
          })
        }
        return data
      } else if (range === "last3") {
        const data = []
        // Year 1 (Prev 2)
        for (let m = 0; m < 12; m++) {
          const val = (activeGross / 3) * distribution[m]
          data.push({
            label: `${monthNames[m]} '${prev2YearSuffix}`,
            desktop: Math.round(val * 0.70),
            mobile: Math.round(val * 0.30),
          })
        }
        // Year 2 (Prev 1)
        for (let m = 0; m < 12; m++) {
          const val = (activeGross / 3) * distribution[m]
          data.push({
            label: `${monthNames[m]} '${prevYearSuffix}`,
            desktop: Math.round(val * 0.70),
            mobile: Math.round(val * 0.30),
          })
        }
        // Year 3 (Current)
        for (let m = 0; m < 12; m++) {
          const val = (activeGross / 3) * distribution[m]
          data.push({
            label: `${monthNames[m]} '${currentYearSuffix}`,
            desktop: Math.round(val * 0.70),
            mobile: Math.round(val * 0.30),
          })
        }
        return data
      } else {
        return monthNames.map((month, i) => {
          const val = activeGross * distribution[i]
          return {
            label: month,
            desktop: Math.round(val * 0.70),
            mobile: Math.round(val * 0.30),
          }
        })
      }
    } else {
      // month
      const weekNames = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"]
      const distribution = [0.22, 0.28, 0.24, 0.26]
      
      const today = new Date()
      const currentMonthIndex = today.getMonth()
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      
      const getMonthName = (offset: number) => {
        let idx = currentMonthIndex + offset
        while (idx < 0) idx += 12
        return monthNames[idx % 12]
      }

      const currentMonthName = getMonthName(0)
      const prevMonthName = getMonthName(-1)
      const prev2MonthName = getMonthName(-2)

      if (range === "last2") {
        const data = []
        // Month 1 (Previous)
        for (let w = 0; w < 4; w++) {
          const val = (activeGross / 2) * distribution[w]
          data.push({
            label: `${prevMonthName} S${w+1}`,
            desktop: Math.round(val * 0.72),
            mobile: Math.round(val * 0.28),
          })
        }
        // Month 2 (Current)
        for (let w = 0; w < 4; w++) {
          const val = (activeGross / 2) * distribution[w]
          data.push({
            label: `${currentMonthName} S${w+1}`,
            desktop: Math.round(val * 0.72),
            mobile: Math.round(val * 0.28),
          })
        }
        return data
      } else if (range === "last3") {
        const data = []
        // Month 1 (Prev 2)
        for (let w = 0; w < 4; w++) {
          const val = (activeGross / 3) * distribution[w]
          data.push({
            label: `${prev2MonthName} S${w+1}`,
            desktop: Math.round(val * 0.72),
            mobile: Math.round(val * 0.28),
          })
        }
        // Month 2 (Prev 1)
        for (let w = 0; w < 4; w++) {
          const val = (activeGross / 3) * distribution[w]
          data.push({
            label: `${prevMonthName} S${w+1}`,
            desktop: Math.round(val * 0.72),
            mobile: Math.round(val * 0.28),
          })
        }
        // Month 3 (Current)
        for (let w = 0; w < 4; w++) {
          const val = (activeGross / 3) * distribution[w]
          data.push({
            label: `${currentMonthName} S${w+1}`,
            desktop: Math.round(val * 0.72),
            mobile: Math.round(val * 0.28),
          })
        }
        return data
      } else {
        return weekNames.map((week, i) => {
          const val = activeGross * distribution[i]
          return {
            label: week,
            desktop: Math.round(val * 0.72),
            mobile: Math.round(val * 0.28),
          }
        })
      }
    }
  })()

  // Calcular intervalo de etiquetas del eje X para evitar colisiones
  const getXAxisInterval = () => {
    if (range === "last3") {
      return period === "year" ? 3 : period === "week" ? 2 : 1
    }
    if (range === "last2") {
      return period === "year" ? 2 : 1
    }
    return 0
  }

  // Dynamic barSize calculations based on active dataset density
  const calculatedBarSize = (() => {
    if (range === "last3") return 4
    if (range === "last2") return 6
    return 14
  })()

  // Format tick labels for the Left YAxis scale
  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
    return String(value)
  }

  const handleRangeSelect = (value: "current" | "last2" | "last3") => {
    setRange(value)
    setDropdownOpen(false)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-sm sm:text-[15px] font-bold text-[var(--text-primary)]">
            Rendimiento de Ventas
          </CardTitle>
          <CardDescription className="text-[10.5px] text-[var(--text-muted)] mt-0.5 font-medium">
            Facturación estimada por tipo de dispositivo
          </CardDescription>
        </div>

        {/* Top-Right Header Elements: inline Trend + Dropdown selector */}
        <div className="flex items-center gap-3.5">
          {/* Custom Tooltip Trend Percentage (Text-only layout at text-sm) */}
          <div className="group relative inline-flex items-center gap-1 text-sm font-bold text-[var(--color-success)] cursor-help pb-0.5">
            <AppIcon icon={TrendingUp} className="h-4 w-4" />
            <span>+5.2%</span>
            
            {/* Hover Tooltip Box */}
            <div className="pointer-events-none absolute bottom-full right-0 mb-2.5 w-48 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-2 text-center text-[10px] leading-relaxed font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-md)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              {period === "week"
                ? "Ventas un 5.2% superiores a la semana anterior."
                : period === "year"
                ? "Ventas un 5.2% superiores al año anterior."
                : "Ventas un 5.2% superiores al mes anterior."}
            </div>
          </div>

          {/* Premium CSS-Only Range Select Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-colors focus:outline-none cursor-pointer"
            >
              <span>{periodRanges[range] || "Periodo"}</span>
              <ChevronDown
                className="h-3 w-3 text-[var(--text-muted)] transition-transform duration-200"
                style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute right-0 mt-1 w-32 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] py-1 shadow-[var(--shadow-md)] z-50 overflow-hidden"
                >
                  {Object.entries(periodRanges).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRangeSelect(value as "current" | "last2" | "last3")}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3 pt-2">
        <ChartContainer config={chartConfig} className="h-[170px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            {/* Cartesian Grid with increased contrast (strokeOpacity={0.7} for better theme visibility) */}
            <CartesianGrid vertical={false} stroke="var(--border-strong)" strokeOpacity={0.7} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              className="fill-[var(--text-muted)] text-[10px] font-semibold"
              interval={getXAxisInterval()}
            />
            {/* Left YAxis Scale with compact tick formatter */}
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
            {/* Pill Capsule Bars: radius=[10, 10, 10, 10], barSize dynamically scaled to calculatedBarSize */}
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={[10, 10, 10, 10]} barSize={calculatedBarSize} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={[10, 10, 10, 10]} barSize={calculatedBarSize} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
