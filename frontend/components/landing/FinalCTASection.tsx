"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Clock } from "lucide-react";

/* Fixed durations — no Math.random() to avoid SSR hydration mismatch */
const ORB_DURATIONS = [7, 9, 6] as const;

/* ─── Floating Orb ─────────────────────────────────────────── */
function FloatingOrb({
  size,
  color,
  duration,
  style,
}: {
  size: number;
  color: string;
  duration: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        filter: `blur(${size * 0.42}px)`,
        ...style,
      }}
      animate={{
        scale: [1, 1.18, 1],
        opacity: [0.55, 0.8, 0.55],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── Trust Pill ────────────────────────────────────────────── */
function TrustPill({
  icon: Icon,
  text,
  iconColor,
}: {
  icon: React.ElementType;
  text: string;
  iconColor: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-white/15 bg-white/70 dark:bg-white/8 backdrop-blur-sm px-4 py-2 text-[0.78rem] font-semibold text-slate-700 dark:text-white/85 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)] transition-colors"
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
      <span>{text}</span>
    </motion.div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export default function FinalCTASection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* ── Theme-Sensitive Full-Bleed Section (Light: Slate-100, Dark: Deep Dark) ── */}
      <div className="relative w-full bg-slate-100/70 dark:bg-[#0a0a0f] py-28 px-6 transition-colors duration-300">

        {/* Dark Mode Overlay Gradient */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #0f0c1a 0%, #080d1a 60%, #0a0a0f 100%)",
          }}
        />

        {/* Light Mode Overlay Gradient */}
        <div
          className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.06) 0%, rgba(255,255,255,0.4) 60%, rgba(241,245,249,0.7) 100%)",
          }}
        />

        {/* ── Ambient glowing orbs ─────────────────────────────── */}
        <FloatingOrb
          size={520}
          duration={ORB_DURATIONS[0]}
          color="radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)"
          style={{ top: "-140px", left: "-120px" }}
        />
        <FloatingOrb
          size={400}
          duration={ORB_DURATIONS[1]}
          color="radial-gradient(circle, rgba(255,107,53,0.18) 0%, transparent 70%)"
          style={{ bottom: "-100px", right: "-80px" }}
        />
        <FloatingOrb
          size={280}
          duration={ORB_DURATIONS[2]}
          color="radial-gradient(circle, rgba(0,122,255,0.14) 0%, transparent 70%)"
          style={{ top: "40%", right: "20%" }}
        />

        {/* ── Subtle Dot Grid Overlay ──────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* ── Shimmer Sweep Line ────────────────────────────────── */}
        <motion.div
          className="absolute inset-y-0 w-[2px] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(245,158,11,0.6) 40%, rgba(255,107,53,0.6) 60%, transparent 100%)",
            filter: "blur(2px)",
          }}
          animate={{ left: ["-5%", "108%"] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatDelay: 4,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* ── Top Edge Accent Line ──────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[rgba(245,158,11,0.55)] to-transparent" />

        {/* ── Bottom Edge Accent Line ───────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[rgba(245,158,11,0.55)] to-transparent" />

        {/* ── Content ───────────────────────────────────────────── */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)] px-5 py-2 text-[0.72rem] font-bold tracking-widest uppercase text-[#f59e0b] mb-7 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
            Únete a negocios que ya lo usan
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white"
          >
            Tu negocio merece{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #f59e0b 0%, #ff6b35 55%, #ff3b30 100%)",
              }}
            >
              operar sin caos.
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="mt-5 max-w-2xl text-[1rem] sm:text-[1.12rem] leading-relaxed text-slate-600 dark:text-white/60"
          >
            Deja de perder clientes por llamadas sin respuesta y citas dobles.{" "}
            <strong className="text-slate-900 dark:text-white/85 font-semibold">
              Automatiza tu agenda, llena tus horarios y cobra más
            </strong>{" "}
            — desde el primer día.
          </motion.p>

          {/* Trust Pills */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <TrustPill icon={Zap} text="Registro 100% Gratis" iconColor="text-[#f59e0b]" />
            <TrustPill
              icon={ShieldCheck}
              text="Cero Doble-Reserva"
              iconColor="text-[#10b981]"
            />
            <TrustPill icon={Clock} text="Reservas 24/7 en Automático" iconColor="text-[#007aff]" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.42, ease: [0.32, 0.72, 0, 1] }}
            className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
          >
            {/* Primary CTA */}
            <Link href="/auth/register">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="relative inline-flex h-14 items-center justify-center gap-3 rounded-full px-9 text-[1rem] font-extrabold text-white cursor-pointer overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(90deg, #f59e0b 0%, #ff6b35 55%, #ef4444 100%)",
                  boxShadow:
                    "0 0 0 1px rgba(245,158,11,0.3), 0 8px 32px -4px rgba(245,158,11,0.45), 0 20px 50px -12px rgba(255,107,53,0.4)",
                }}
              >
                <span className="relative z-10">Comienza a automatizar</span>
                <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>

            {/* Secondary CTA */}
            <Link href="/sucursales">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-white/6 backdrop-blur-sm px-8 text-[0.95rem] font-semibold text-slate-800 dark:text-white/75 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-sm dark:shadow-none"
              >
                Ver mapa de negocios
              </motion.div>
            </Link>
          </motion.div>

          {/* Micro Reassurance */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-5 text-[0.72rem] text-slate-500 dark:text-white/35 tracking-wide"
          >
            Sin tarjeta de crédito · Activación en menos de 2 minutos · Cancela cuando quieras
          </motion.p>
        </div>
      </div>
    </section>
  );
}
