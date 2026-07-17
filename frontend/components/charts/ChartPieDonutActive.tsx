"use client"
import { Pie, PieChart, type PieLabelRenderProps } from "recharts"
import { motion } from "framer-motion"
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
export interface PaymentMethodItem {
  id: string;
  label: string;
  val: number;
  icon: React.ElementType;
}

export interface ChartPieDonutActiveProps {
  data: PaymentMethodItem[];
}

const PAYMENT_COLORS: Record<string, string> = {
  cash: "var(--color-pending)",
  credit_card: "var(--app-primary)",
  transfer: "#a855f7", // purple
  online: "var(--color-success)",
};

const chartConfig = {
  value: {
    label: "Monto",
  },
} satisfies ChartConfig

// Custom label renderer to place Lucide icons directly inside Pie segments
// Defined as a static top-level function to avoid React re-creation and unmounting/flickering bugs
const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, payload, percent = 0 } = props;
  const Icon = (payload as { icon?: React.ElementType })?.icon;
  if (!Icon) return null;
  
  // Hide icons if the segment percentage is very small (under 5%) to prevent crowding
  if (percent < 0.05) return null;
  
  const RADIAN = Math.PI / 180;
  // Calculate centroid exactly in the middle of the segment ring
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      <g transform="translate(-7, -7)">
        <Icon className="h-3.5 w-3.5 text-white pointer-events-none" />
      </g>
    </g>
  );
};
export function ChartPieDonutActive({ data }: ChartPieDonutActiveProps) {
  // Transform input data to chart structure
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.val,
    fill: PAYMENT_COLORS[item.id] || "var(--text-muted)",
    icon: item.icon,
  }))
  return (
    <Card className="flex flex-col lg:h-[260px] min-h-0">
      <CardHeader className="pb-0 pt-3.5 px-4 shrink-0">
        <CardTitle className="text-sm sm:text-[15px] font-bold text-[var(--text-primary)]">
          Métodos de Pago
        </CardTitle>
      </CardHeader>
     <CardContent className="flex-1 pb-1 pt-0 px-2 flex items-center justify-center min-h-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full flex items-center justify-center min-h-0">
            <ChartContainer
            config={chartConfig}
            className="mx-auto w-full aspect-square max-h-[230px]"
            >
            {/* PieChart margin to prevent icons from getting clipped at boundaries */}
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="95%"
                strokeWidth={2}
                stroke="var(--surface-3)"
                label={renderCustomizedLabel}
                labelLine={false}
                isAnimationActive={false}
                />
            </PieChart>
            </ChartContainer>
        </motion.div>
        </CardContent>
    </Card>
  )
}