import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"


const surfaceVariants = cva(
  "transition-colors",
  {
    variants: {
      variant: {
        solid: "",
        glass: "backdrop-blur-xl",
      },

      surface: {
        0: "bg-[var(--surface-0)]",
        1: "bg-[var(--surface-1)]",
        2: "bg-[var(--surface-2)]",
        3: "bg-[var(--surface-3)]",

        glass: "bg-[var(--glass-bg)]",
      },

      border: {
        soft: "border border-[var(--border-soft)]",
        strong: "border border-[var(--border-strong)]",
        glass: "border border-[var(--glass-border)]",
        none: "",
      },

      shadow: {
        sm: "shadow-[var(--shadow-[var(--shadow-sm)])]",
        md: "shadow-[var(--shadow-md)]",
        lg: "shadow-[var(--shadow-lg)]",
        glass: "shadow-[var(--glass-shadow)]",
        none: "",
      },

      radius: {
        sm: "rounded-xl",
        md: "rounded-2xl",
        lg: "rounded-3xl",
        full: "rounded-full",
      },
    },

    defaultVariants: {
      variant: "solid",
      surface: 1,
      border: "soft",
      shadow: "sm",
      radius: "md",
    },
  }
)

type SurfaceElement = React.ElementType

export interface SurfaceProps extends VariantProps<typeof surfaceVariants> {
  as?: SurfaceElement
  className?: string
  children?: React.ReactNode
}
export function Surface({
  as: Component = "div",
  className,
  variant,
  surface,
  border,
  shadow,
  radius,
  children,
  ...props
}: SurfaceProps &
  Omit<React.ComponentPropsWithoutRef<SurfaceElement>, keyof SurfaceProps>) {
  return (
    <Component
      className={[
        surfaceVariants({
          variant,
          surface,
          border,
          shadow,
          radius,
        }),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  )
}