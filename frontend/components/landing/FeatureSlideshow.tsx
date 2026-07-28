"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, CheckCircle, type LucideIcon } from "lucide-react";
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
    previewBadge: "Paso 1: Setup Simple",
    previewTitle: "Catálogo y Personal Centralizado",
    previewDescription: "Precios, duraciones y especialistas listos para recibir reservas.",
  },
  {
    id: "step-2",
    stepNumber: "2",
    title: "2. Reservas en piloto automático 24/7",
    description: "Tus clientes eligen servicio, hora y especialista solos desde su celular, sin interrumpirte con llamadas ni chats de WhatsApp.",
    badge: "Cero Interrupciones",
    icon: Clock,
    previewBadge: "Paso 2: Automatización",
    previewTitle: "Portal de Reservas Autónomo",
    previewDescription: "Tus clientes agendan solos a cualquier hora del día.",
  },
  {
    id: "step-3",
    stepNumber: "3",
    title: "3. Blindaje anti doble-reserva y cero plantones",
    description: "El motor inteligente valida la disponibilidad de tu equipo segundo a segundo, evitando cruces de horarios y maximizando tus ingresos.",
    badge: "Ingresos Protegidos",
    icon: Calendar,
    previewBadge: "Paso 3: Máxima Rentabilidad",
    previewTitle: "Protección Operativa en Tiempo Real",
    previewDescription: "Sincronización instantánea de equipo y prevención de huecos muertos.",
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
                    // Previous steps: completed 100% bar
                    <div className="w-full h-full bg-[var(--app-primary)] rounded-full" />
                  ) : idx > activeStep ? (
                    // Future steps: empty 0% bar
                    <div className="w-full h-0 bg-transparent" />
                  ) : (
                    // Active step: animates fill top-to-bottom from 0% to 100%
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

        {/* Right Column - Interactive Device / Screen Preview (Entrepreneur Perspective) */}
        <div className="lg:col-span-7 h-[340px] sm:h-[380px] rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-md)] overflow-hidden relative p-6 sm:p-8 flex flex-col justify-center items-center">
          {/* Soft grid ambient background */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:16px_16px] opacity-35 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="w-full max-w-md flex flex-col gap-3.5 z-10"
            >
              {currentStep.previewContent ? (
                currentStep.previewContent
              ) : currentStep.previewImage ? (
                <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-strong)] shadow-[var(--shadow-sm)] bg-[var(--surface-2)]">
                  <img
                    src={currentStep.previewImage}
                    alt={currentStep.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ) : (
                /* Built-in default mockup visuals tailored for Business Owners */
                <>
                  {currentStep.previewBadge && (
                    <span className="text-[0.65rem] font-bold text-[var(--app-primary)] uppercase tracking-wider">
                      {currentStep.previewBadge}
                    </span>
                  )}
                  {currentStep.previewTitle && (
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {currentStep.previewTitle}
                    </h3>
                  )}

                  {/* Step 1 Preview: Business Services & Staff Setup */}
                  {activeStep === 0 && (
                    <div className="space-y-2.5">
                      <div className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3.5 flex justify-between items-center shadow-[var(--shadow-sm)]">
                        <div>
                          <p className="text-[0.8rem] font-bold text-[var(--text-primary)]">
                            Corte & Barba Executive
                          </p>
                          <p className="text-[0.7rem] text-[var(--text-muted)] mt-0.5">
                            45 min · 3 Especialistas asignados
                          </p>
                        </div>
                        <span className="text-[0.82rem] font-bold text-[var(--app-primary)]">
                          $45.000
                        </span>
                      </div>
                      <div className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3 flex justify-between items-center opacity-70">
                        <div>
                          <p className="text-[0.78rem] font-semibold text-[var(--text-primary)]">
                            Facial Hidratante
                          </p>
                          <p className="text-[0.68rem] text-[var(--text-muted)]">60 min · 2 Especialistas</p>
                        </div>
                        <span className="text-[0.82rem] font-semibold text-[var(--text-primary)]">
                          $65.000
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step 2 Preview: Autonomous Client Booking Link */}
                  {activeStep === 1 && (
                    <div className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 space-y-3 shadow-[var(--shadow-sm)]">
                      <div className="flex items-center justify-between border-b border-[var(--border-strong)]/40 pb-2">
                        <span className="text-[0.7rem] font-bold text-[var(--app-primary)] uppercase tracking-wider">
                          Reserva Recibida 24/7
                        </span>
                        <span className="rounded-full bg-[color-mix(in_oklab,var(--color-success)_10%,transparent)] px-2 py-0.5 text-[0.62rem] font-bold text-[var(--color-success)] border border-[var(--color-success)]/10">
                          Sin llamadas
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.82rem] font-bold text-[var(--text-primary)]">
                          Cliente: Camilo R.
                        </p>
                        <p className="text-[0.74rem] text-[var(--text-muted)]">
                          Mañana a las 10:30 AM · Especialista Adrian M.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3 Preview: Anti-Double Booking & Revenue Protection */}
                  {activeStep === 2 && (
                    <div className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 space-y-3 shadow-[var(--shadow-sm)]">
                      <div className="flex items-center justify-between border-b border-[var(--border-strong)]/40 pb-2">
                        <div className="flex items-center gap-2 text-[var(--color-success)]">
                          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                          <span className="text-[0.8rem] font-bold">Motor Anti-Solapamiento Activo</span>
                        </div>
                        <span className="rounded-full bg-[color-mix(in_oklab,var(--app-primary)_10%,transparent)] px-2.5 py-0.5 text-[0.62rem] font-bold text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                          100% Ocupación
                        </span>
                      </div>
                      <p className="text-[0.75rem] text-[var(--text-muted)] leading-relaxed">
                        Protección contra doble-reserva en tiempo real · Validación de horarios segundo a segundo para todo el personal.
                      </p>
                    </div>
                  )}
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

