"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LightRaysProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
  count?: number
  color?: string
  blur?: number
  speed?: number
  length?: string
}

type LightRay = {
  id: string
  left: number
  rotate: number
  width: number
  swing: number
  delay: number
  duration: number
  intensity: number
}

const createRays = (count: number, cycle: number): LightRay[] => {
  if (count <= 0) return []

  return Array.from({ length: count }, (_, index) => {
    const left = 8 + Math.random() * 84
    const rotate = -28 + Math.random() * 56
    const width = 160 + Math.random() * 160
    const swing = 0.8 + Math.random() * 1.8
    const delay = Math.random() * cycle
    const duration = cycle * (0.75 + Math.random() * 0.5)
    const intensity = 0.6 + Math.random() * 0.5

    return {
      id: `${index}-${Math.round(left * 10)}`,
      left,
      rotate,
      width,
      swing,
      delay,
      duration,
      intensity,
    }
  })
}

const Ray = ({
  left,
  rotate,
  width,
  swing,
  delay,
  duration,
  intensity,
}: LightRay) => {
  return (
    <>
      {/* DARK MODE RAY: 100% EXACT ORIGINAL UNTOUCHED COMPONENT & STYLES */}
      <motion.div
        className="hidden dark:block pointer-events-none absolute -top-[12%] left-[var(--ray-left)] h-[var(--light-rays-length)] w-[var(--ray-width)] origin-top -translate-x-1/2 rounded-full bg-linear-to-b from-[color-mix(in_srgb,var(--light-rays-color)_70%,transparent)] to-transparent opacity-0 mix-blend-screen blur-[var(--light-rays-blur)]"
        style={
          {
            "--ray-left": `${left}%`,
            "--ray-width": `${width}px`,
          } as CSSProperties
        }
        initial={{ rotate: rotate }}
        animate={{
          opacity: [0, intensity, 0],
          rotate: [rotate - swing, rotate + swing, rotate - swing],
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
          repeatDelay: duration * 0.1,
        }}
      />

      {/* LIGHT MODE RAY: SOFT ETHEREAL LIGHT HALO ON WHITE SURFACES */}
      <motion.div
        className="dark:hidden pointer-events-none absolute -top-[12%] left-[var(--ray-left)] h-[var(--light-rays-length)] w-[var(--ray-width)] origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-[#3b82f6]/22 via-[#60a5fa]/10 to-transparent opacity-0 mix-blend-multiply blur-[calc(var(--light-rays-blur)+8px)] transition-opacity duration-300"
        style={
          {
            "--ray-left": `${left}%`,
            "--ray-width": `${width}px`,
          } as CSSProperties
        }
        initial={{ rotate: rotate }}
        animate={{
          opacity: [0, intensity * 0.75, 0],
          rotate: [rotate - swing, rotate + swing, rotate - swing],
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
          repeatDelay: duration * 0.1,
        }}
      />
    </>
  )
}

export function LightRays({
  className,
  style,
  count = 7,
  color = "rgba(160, 210, 255, 0.2)",
  blur = 36,
  speed = 14,
  length = "70vh",
  ref,
  ...props
}: LightRaysProps) {
  const [rays, setRays] = useState<LightRay[]>([])
  const cycleDuration = Math.max(speed, 0.1)

  useEffect(() => {
    setRays(createRays(count, cycleDuration))
  }, [count, cycleDuration])

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute inset-0 isolate overflow-hidden rounded-[inherit]",
        className
      )}
      style={
        {
          "--light-rays-color": color,
          "--light-rays-blur": `${blur}px`,
          "--light-rays-length": length,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* DARK MODE AMBIENT GLOW: 100% EXACT ORIGINAL UNTOUCHED */}
        <div
          aria-hidden
          className="hidden dark:block absolute inset-0 opacity-60"
          style={
            {
              background:
                "radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--light-rays-color) 45%, transparent), transparent 70%)",
            } as CSSProperties
          }
        />
        <div
          aria-hidden
          className="hidden dark:block absolute inset-0 opacity-60"
          style={
            {
              background:
                "radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--light-rays-color) 35%, transparent), transparent 75%)",
            } as CSSProperties
          }
        />

        {/* LIGHT MODE AMBIENT GLOW: SOFT LIGHT HALO */}
        <div
          aria-hidden
          className="dark:hidden absolute inset-0 opacity-100 transition-opacity"
          style={
            {
              background:
                "radial-gradient(circle at 20% 15%, rgba(59, 130, 246, 0.12), transparent 70%), radial-gradient(circle at 80% 10%, rgba(96, 165, 250, 0.08), transparent 75%)",
            } as CSSProperties
          }
        />

        {rays.map((ray) => (
          <Ray key={ray.id} {...ray} />
        ))}
      </div>
    </div>
  )
}