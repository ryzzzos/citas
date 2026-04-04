import type { ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const ICON_SIZE_CLASS = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

export type AppIconSize = keyof typeof ICON_SIZE_CLASS;

interface AppIconProps extends Omit<ComponentPropsWithoutRef<"svg">, "size"> {
  icon: LucideIcon;
  size?: AppIconSize;
  decorative?: boolean;
}

export default function AppIcon({
  icon: Icon,
  size = "sm",
  decorative = true,
  className,
  ...props
}: AppIconProps) {
  return (
    <Icon
      aria-hidden={decorative ? true : undefined}
      focusable={decorative ? false : undefined}
      className={cn(ICON_SIZE_CLASS[size], className)}
      {...props}
    />
  );
}
