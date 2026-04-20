import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const glassSharedSurface =
  "isolate border border-[color:var(--glass-border-soft)]"

export const glassRecipes = {
  surfaceSoft: cn(
    glassSharedSurface,
    "[background:linear-gradient(180deg,var(--glass-highlight)_0%,var(--glass-highlight-soft)_100%),var(--glass-bg-soft)]",
    "shadow-[var(--glass-shadow-sm)]",
    "backdrop-blur-[var(--glass-blur-sm)] backdrop-saturate-[var(--glass-saturation-sm)]"
  ),
  surfaceStrong: cn(
    glassSharedSurface,
    "border-[color:var(--glass-border-default)]",
    "[background:linear-gradient(180deg,var(--glass-highlight)_0%,var(--glass-highlight-soft)_100%),var(--glass-bg-base)]",
    "shadow-[var(--glass-shadow-md)]",
    "backdrop-blur-[var(--glass-blur-md)] backdrop-saturate-[var(--glass-saturation-md)]"
  ),
  floating: cn(
    "isolate rounded-full border border-[color:var(--glass-border-default)]",
    "[background:linear-gradient(180deg,var(--glass-highlight)_0%,var(--glass-highlight-soft)_100%),var(--glass-bg-strong)]",
    "shadow-[var(--glass-shadow-sm)]",
    "backdrop-blur-[var(--glass-blur-sm)] backdrop-saturate-[var(--glass-saturation-sm)]",
    "transition-transform transition-colors duration-200",
    "hover:border-[color:var(--dashboard-border-default)]",
    "active:translate-y-px"
  ),
  floatingMuted: cn(
    "isolate rounded-full border border-[color:var(--glass-border-soft)]",
    "[background:linear-gradient(180deg,var(--glass-highlight)_0%,var(--glass-highlight-soft)_100%),var(--glass-bg-soft)]",
    "shadow-[var(--glass-shadow-sm)]",
    "backdrop-blur-[var(--glass-blur-sm)] backdrop-saturate-[var(--glass-saturation-sm)]"
  ),
  island: cn(
    "isolate border border-[color:var(--glass-border-default)]",
    "[background:linear-gradient(180deg,var(--glass-highlight)_0%,var(--glass-highlight-soft)_100%),var(--glass-bg-base)]",
    "shadow-[var(--glass-shadow-md)]",
    "backdrop-blur-[var(--glass-blur-md)] backdrop-saturate-[var(--glass-saturation-sm)]"
  ),
  overlay: cn(
    "[background:linear-gradient(180deg,rgba(255,255,255,0.22)_0%,var(--glass-backdrop)_100%)]",
    "dark:[background:linear-gradient(180deg,rgba(15,23,42,0.26)_0%,var(--glass-backdrop)_100%)]",
    "backdrop-blur-[2px] backdrop-saturate-[100%]"
  ),
} as const
