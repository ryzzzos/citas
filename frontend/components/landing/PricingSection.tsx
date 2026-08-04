"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Plan Data ─────────────────────────────────────────────── */

interface PlanFeature {
  text: string;
  highlighted?: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyEquivalentMonthly: number;
  description: string;
  features: PlanFeature[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

const PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Emprendedor",
    monthlyPrice: 39000,
    yearlyEquivalentMonthly: 31200,
    description:
      "Ideal para profesionales independientes y locales que comienzan a agendar en línea.",
    features: [
      { text: "1 Sucursal" },
      { text: "3 Especialistas" },
      { text: "Catálogo de servicios ilimitado" },
      { text: "Reservas online 24/7" },
      { text: "Motor anti sobre-reserva en tiempo real" },
      { text: "Link público de reserva personalizado" },
    ],
    cta: "Suscribirse",
  },
  {
    id: "pro",
    name: "Crecimiento",
    monthlyPrice: 59000,
    yearlyEquivalentMonthly: 47200,
    description:
      "Para negocios en expansión que necesitan coordinar equipo y múltiples sedes.",
    features: [
      { text: "Hasta 3 Sucursales" },
      { text: "Hasta 9 Especialistas" },
      { text: "Catálogo de servicios ilimitado" },
      { text: "Reservas online 24/7" },
      { text: "Motor anti sobre-reserva en tiempo real" },
      { text: "Link público de reserva personalizado" },
      { text: "Gestión multisede", highlighted: true },
    ],
    cta: "Suscribirse",
    highlighted: true,
    badge: "Más Popular",
  },
  {
    id: "enterprise",
    name: "Multi-Sucursal",
    monthlyPrice: 79000,
    yearlyEquivalentMonthly: 63200,
    description:
      "Diseñado para cadenas, franquicias y centros de servicios a gran escala.",
    features: [
      { text: "Sucursales ilimitadas" },
      { text: "Especialistas ilimitados" },
      { text: "Catálogo de servicios ilimitado" },
      { text: "Reservas online 24/7" },
      { text: "Motor anti sobre-reserva en tiempo real" },
      { text: "Link público de reserva personalizado" },
      { text: "Gestión multisede ilimitada", highlighted: true },
    ],
    cta: "Suscribirse",
  },
];

const YEARLY_DISCOUNT_PERCENT = 20;

/* ── Billing Toggle ────────────────────────────────────────── */

function BillingToggle({
  isYearly,
  onToggle,
}: {
  isYearly: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-[var(--surface-3)] border border-[var(--border-strong)] p-1 shadow-[var(--shadow-sm)]">
      <button
        type="button"
        onClick={() => !isYearly || onToggle()}
        className={cn(
          "relative rounded-full px-4 py-2 text-[0.78rem] font-semibold transition-colors duration-300 cursor-pointer select-none",
          !isYearly
            ? "text-white"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        )}
      >
        {!isYearly && (
          <motion.div
            layoutId="billing-toggle-pill"
            className="absolute inset-0 rounded-full bg-primary-gradient shadow-[var(--shadow-sm)]"
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          />
        )}
        <span className="relative z-10">Mensual</span>
      </button>

      <button
        type="button"
        onClick={() => isYearly || onToggle()}
        className={cn(
          "relative rounded-full px-4 py-2 text-[0.78rem] font-semibold transition-colors duration-300 cursor-pointer select-none flex items-center gap-1.5",
          isYearly
            ? "text-white"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        )}
      >
        {isYearly && (
          <motion.div
            layoutId="billing-toggle-pill"
            className="absolute inset-0 rounded-full bg-primary-gradient shadow-[var(--shadow-sm)]"
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          />
        )}
        <span className="relative z-10">Anual</span>
        <span className="relative z-10 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[0.62rem] font-bold tracking-wide">
          −{YEARLY_DISCOUNT_PERCENT}%
        </span>
      </button>
    </div>
  );
}

/* ── Price Display with Animated Transition ────────────────── */

function AnimatedPrice({
  price,
  isYearly,
}: {
  price: number;
  isYearly: boolean;
}) {
  const yearlyTotal = price * 12;
  const formattedPrice = price.toLocaleString("es-CO");
  const formattedYearlyTotal = yearlyTotal.toLocaleString("es-CO");

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-baseline gap-1">
        <span className="text-[0.88rem] font-semibold text-[var(--text-muted)]">
          $
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={price}
            initial={{ y: 12, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -12, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]"
          >
            {formattedPrice}
          </motion.span>
        </AnimatePresence>
        <span className="text-[0.82rem] font-medium text-[var(--text-muted)] ml-0.5">
          COP/mes
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={isYearly ? "yearly" : "monthly"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-[0.7rem] text-[var(--text-muted)] mt-1"
        >
          {isYearly
            ? `Facturado anualmente ($${formattedYearlyTotal}/año)`
            : "Facturado mes a mes"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ── Plan Card ─────────────────────────────────────────────── */

function PlanCard({
  plan,
  isYearly,
  index,
}: {
  plan: PricingPlan;
  isYearly: boolean;
  index: number;
}) {
  const displayPrice = isYearly
    ? plan.yearlyEquivalentMonthly
    : plan.monthlyPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: 0.1 + index * 0.1,
        ease: [0.32, 0.72, 0, 1],
      }}
      className={cn(
        "relative flex flex-col rounded-[var(--radius-2xl)] border p-5 sm:p-7 transition-all duration-300",
        plan.highlighted
          ? "bg-[var(--surface-3)] border-[var(--app-primary)]/30 shadow-[var(--shadow-lg)] scale-[1.02] lg:scale-105"
          : "bg-[var(--surface-2)] border-[var(--border-strong)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
      )}
    >
      {/* Ambient glow for highlighted plan */}
      {plan.highlighted && (
        <div className="absolute -inset-[1px] rounded-[var(--radius-2xl)] bg-gradient-to-b from-[var(--app-primary)]/15 via-transparent to-[var(--app-primary-strong)]/10 pointer-events-none -z-10 blur-sm" />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-primary-gradient px-3.5 py-1 text-[0.65rem] font-bold text-white shadow-[var(--shadow-md)] tracking-wide uppercase">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {plan.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-[0.8rem] leading-relaxed text-[var(--text-muted)] mb-6 min-h-[2.5rem]">
        {plan.description}
      </p>

      {/* Price */}
      <div className="mb-6">
        <AnimatedPrice price={displayPrice} isYearly={isYearly} />
      </div>

      {/* CTA Button */}
      <Link
        href="/auth/register"
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full px-6 text-[0.82rem] font-semibold transition-all duration-200 active:scale-[0.98] mb-6",
          plan.highlighted
            ? "bg-primary-gradient text-white shadow-[var(--shadow-md)] hover:brightness-110"
            : "bg-[var(--surface-3)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-2)]"
        )}
      >
        {plan.cta}
      </Link>

      {/* Separator */}
      <div className="h-px bg-[var(--border-strong)]/50 mb-5" />

      {/* Features List */}
      <ul className="space-y-3 flex-1">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-2.5">
            <div
              className={cn(
                "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 shadow-xs",
                plan.highlighted
                  ? "bg-[var(--app-primary)]"
                  : "bg-[var(--color-success)]"
              )}
            >
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </div>
            <span
              className={cn(
                "text-[0.78rem] leading-snug",
                feature.highlighted
                  ? "text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-secondary)]"
              )}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── Main PricingSection Component ─────────────────────────── */

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-[0.7rem] sm:text-[0.75rem] font-bold text-[var(--app-primary)] tracking-widest uppercase mb-2 inline-block"
        >
          PLANES Y PRECIOS
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]"
        >
          Un plan para cada etapa de tu negocio
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[0.85rem] sm:text-[0.92rem] text-[var(--text-muted)] mt-2.5 leading-relaxed"
        >
          Comienza gratis y escala según tu ritmo. Sin contratos a largo plazo,
          sin costos ocultos.
        </motion.p>
      </div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex justify-center mb-10 sm:mb-12"
      >
        <BillingToggle
          isYearly={isYearly}
          onToggle={() => setIsYearly((prev) => !prev)}
        />
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-5 items-start">
        {PLANS.map((plan, idx) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isYearly={isYearly}
            index={idx}
          />
        ))}
      </div>

      {/* Reassurance Text */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center text-[0.72rem] text-[var(--text-muted)] mt-8 tracking-wide"
      >
        Sin contratos a largo plazo. Cambia de plan o cancela en cualquier momento.
      </motion.p>
    </section>
  );
}
