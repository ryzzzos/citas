"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, type LucideIcon } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";

export interface FeatureStep {
  id: string;
  stepNumber?: string | number;
  title: string;
  description: string;
  badge?: string;
  icon?: LucideIcon;
  previewBadge?: string;
  previewTitle?: string;
  previewDescription?: string;
  previewImage?: string;
  previewContent?: React.ReactNode;
}

export interface FeatureSlideshowProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  steps?: FeatureStep[];
  autoPlayInterval?: number;
  className?: string;
}

const DEFAULT_STEPS: FeatureStep[] = [
  {
    id: "step-1",
    stepNumber: "1",
    title: "1. Digitaliza tu catálogo y equipo",
    description: "Configura tus sucursales, servicios, tarifas y asigna horarios de atención a tus colaboradores en menos de 2 minutos.",
    badge: "Setup en 2 Minutos",
    icon: MapPin,
    previewBadge: "Setup Simple",
    previewTitle: "Tu catálogo listo al instante",
    previewDescription: "Servicios, precios y equipo organizados en un solo lugar.",
    previewImage: "/benefit-catalog-setup.png",
  },
  {
    id: "step-2",
    stepNumber: "2",
    title: "2. Reservas en piloto automático 24/7",
    description: "Tus clientes eligen servicio, hora y especialista solos desde su celular, sin interrumpirte con llamadas ni chats de WhatsApp.",
    badge: "Cero Interrupciones",
    icon: Clock,
    previewBadge: "Automatización",
    previewTitle: "Reservas mientras duermes",
    previewDescription: "Tus clientes agendan solos, a cualquier hora.",
    previewImage: "/benefit-autopilot-booking.png",
  },
  {
    id: "step-3",
    stepNumber: "3",
    title: "3. Blindaje anti doble-reserva y cero plantones",
    description: "El motor inteligente valida la disponibilidad de tu equipo segundo a segundo, evitando cruces de horarios y maximizando tus ingresos.",
    badge: "Ingresos Protegidos",
    icon: Calendar,
    previewBadge: "Máxima Rentabilidad",
    previewTitle: "Agenda blindada, cero cruces",
    previewDescription: "Validación en tiempo real que protege cada minuto de tu equipo.",
    previewImage: "/benefit-anti-overlap.png",
  },
];

export function FeatureSlideshow({
  eyebrow = "BENEFICIOS CLAVE",
  title = "Diseñado para escalar tu negocio",
  subtitle = "Elimina el caos de la agenda manual, automatiza la captura de clientes y enfócate en facturar más.",
  steps = DEFAULT_STEPS,
  autoPlayInterval = 5000,
  className,
}: FeatureSlideshowProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const handleSelectStep = React.useCallback((idx: number) => {
    setActiveStep(idx);
    setTimerKey((prev) => prev + 1);
  }, []);

  const handleAutoNext = React.useCallback(() => {
    setActiveStep((prev) => (prev + 1) % (steps.length || 1));
    setTimerKey((prev) => prev + 1);
  }, [steps.length]);

  const currentStep = steps[activeStep] || steps[0];

  return (
    <section className={cn("relative z-10 max-w-5xl mx-auto px-6 py-12 sm:py-16", className)}>
      {/* Header Section */}
      {(eyebrow || title || subtitle) && (
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          {eyebrow && (
            <span className="text-[0.7rem] sm:text-[0.75rem] font-bold text-[var(--app-primary)] tracking-widest uppercase mb-2 inline-block">
              {eyebrow}
            </span>
          )}
          {title && (
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-[0.85rem] sm:text-[0.92rem] text-[var(--text-muted)] mt-2.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Grid: Steps list on the left, Preview on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column - Steps selector (Non-card sleek layout with vertical progress fill) */}
        <div className="lg:col-span-5 space-y-2 relative">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={cn(
                  "w-full text-left pl-6 pr-4 py-3.5 rounded-[var(--radius-md)] transition-all duration-300 relative flex items-start gap-3.5 cursor-pointer group select-none",
                  isActive
                    ? "bg-[var(--surface-2)]/80 backdrop-blur-xs"
                    : "bg-transparent hover:bg-[var(--surface-2)]/40"
                )}
              >
                {/* Left Progress Bar Track */}
                <div className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[var(--border-strong)]/30 overflow-hidden">
                  {idx < activeStep ? (
                    <div className="w-full h-full bg-[var(--app-primary)] rounded-full" />
                  ) : idx > activeStep ? (
                    <div className="w-full h-0 bg-transparent" />
                  ) : (
                    <motion.div
                      key={`${activeStep}-${timerKey}`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: autoPlayInterval / 1000,
                        ease: "linear",
                      }}
                      onAnimationComplete={handleAutoNext}
                      className="w-full h-full bg-gradient-to-b from-[var(--app-primary)] to-[var(--app-primary-strong)] rounded-full origin-top shadow-[0_0_8px_var(--app-primary)]"
                    />
                  )}
                </div>

                {step.icon && (
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 mt-0.5",
                      isActive
                        ? "bg-[color-mix(in_oklab,var(--app-primary)_15%,transparent)] text-[var(--app-primary)] border border-[var(--app-primary)]/30 shadow-[var(--shadow-sm)] scale-105"
                        : "bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                    )}
                  >
                    <AppIcon icon={step.icon} className="h-4.5 w-4.5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {step.badge && (
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-[0.62rem] font-bold border mb-1 transition-colors duration-300",
                        isActive
                          ? "bg-[color-mix(in_oklab,var(--app-primary)_10%,transparent)] text-[var(--app-primary)] border-[var(--app-primary)]/20"
                          : "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border-strong)]/60"
                      )}
                    >
                      {step.badge}
                    </span>
                  )}
                  <h3
                    className={cn(
                      "text-[0.92rem] font-bold tracking-tight transition-colors duration-300",
                      isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                    )}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={cn(
                      "text-[0.78rem] mt-1 leading-relaxed transition-colors duration-300",
                      isActive ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]/80"
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column — Expressive Illustration Preview */}
        <div className="lg:col-span-7 h-[360px] sm:h-[420px] rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-lg)] overflow-hidden relative">
          {/* Ambient glow that shifts with each step */}
          <motion.div
            key={`glow-${activeStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                activeStep === 0
                  ? "radial-gradient(ellipse at 70% 30%, color-mix(in oklab, var(--app-primary) 8%, transparent) 0%, transparent 70%)"
                  : activeStep === 1
                    ? "radial-gradient(ellipse at 50% 60%, color-mix(in oklab, var(--color-info) 8%, transparent) 0%, transparent 70%)"
                    : "radial-gradient(ellipse at 30% 70%, color-mix(in oklab, var(--color-success) 8%, transparent) 0%, transparent 70%)",
            }}
          />

          {/* Soft dot grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-strong)_0.5px,transparent_0.5px)] [background-size:20px_20px] opacity-20 pointer-events-none z-[1]" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-full h-full flex flex-col z-[2]"
            >
              {currentStep.previewContent ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  {currentStep.previewContent}
                </div>
              ) : (
                <>
                  {/* Hero Illustration Area */}
                  <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6">
                    {currentStep.previewImage ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
                        className="relative w-full h-full max-w-[340px] max-h-[260px] sm:max-h-[300px]"
                      >
                        <Image
                          src={currentStep.previewImage}
                          alt={currentStep.previewTitle || currentStep.title}
                          fill
                          className="object-contain drop-shadow-lg"
                          sizes="(max-width: 768px) 90vw, 400px"
                          priority={activeStep === 0}
                        />
                      </motion.div>
                    ) : (
                      /* Fallback: decorative icon if no image */
                      <div className="w-28 h-28 rounded-full bg-[color-mix(in_oklab,var(--app-primary)_10%,transparent)] border border-[var(--app-primary)]/20 flex items-center justify-center">
                        {currentStep.icon && (
                          <AppIcon icon={currentStep.icon} className="h-12 w-12 text-[var(--app-primary)]" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Floating Glassmorphic Info Bar — overlays the bottom */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
                    className="mx-3 sm:mx-4 mb-3 sm:mb-4 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)]/80 backdrop-blur-xl shadow-[var(--shadow-md)] px-4 sm:px-5 py-3 sm:py-3.5"
                  >
                    <div className="flex items-start gap-3">
                      {/* Step accent dot */}
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 rounded-full shrink-0 ring-4",
                          activeStep === 0
                            ? "bg-[var(--app-primary)] ring-[var(--app-primary)]/15"
                            : activeStep === 1
                              ? "bg-[var(--color-info)] ring-[var(--color-info)]/15"
                              : "bg-[var(--color-success)] ring-[var(--color-success)]/15"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        {currentStep.previewBadge && (
                          <span
                            className={cn(
                              "text-[0.6rem] font-bold uppercase tracking-widest",
                              activeStep === 0
                                ? "text-[var(--app-primary)]"
                                : activeStep === 1
                                  ? "text-[var(--color-info)]"
                                  : "text-[var(--color-success)]"
                            )}
                          >
                            {currentStep.previewBadge}
                          </span>
                        )}
                        {currentStep.previewTitle && (
                          <h3 className="text-[0.88rem] sm:text-[0.95rem] font-bold text-[var(--text-primary)] tracking-tight leading-snug">
                            {currentStep.previewTitle}
                          </h3>
                        )}
                        {currentStep.previewDescription && (
                          <p className="text-[0.72rem] sm:text-[0.76rem] text-[var(--text-muted)] leading-relaxed mt-0.5">
                            {currentStep.previewDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default FeatureSlideshow;
