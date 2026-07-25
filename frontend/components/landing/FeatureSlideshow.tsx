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
  className?: string;
}

const DEFAULT_STEPS: FeatureStep[] = [
  {
    id: "step-1",
    stepNumber: "1",
    title: "1. Busca un local",
    description: "Explora salones, barberías, spas o centros médicos cercanos en el mapa interactivo.",
    badge: "B2C Marketplace",
    icon: MapPin,
    previewBadge: "Paso 1: Localización",
    previewTitle: "Mapa y Filtros en Vivo",
    previewDescription: "Resultados ordenados por distancia en tu ciudad.",
  },
  {
    id: "step-2",
    stepNumber: "2",
    title: "2. Elige el servicio",
    description: "Selecciona el servicio que deseas, revisa el precio, duración y el especialista de tu preferencia.",
    badge: "Transparencia Total",
    icon: Calendar,
    previewBadge: "Paso 2: Selección",
    previewTitle: "Servicios Personalizados",
    previewDescription: "Revisa tarifas y duraciones en tiempo real.",
  },
  {
    id: "step-3",
    stepNumber: "3",
    title: "3. Reserva al instante",
    description: "Escoge una hora disponible y confirma. Sin llamadas telefónicas ni tiempos de espera.",
    badge: "Confirmación 24/7",
    icon: Clock,
    previewBadge: "Paso 3: Confirmación",
    previewTitle: "Ticket de Reserva Generado",
    previewDescription: "Confirmación automática inmediata 24/7.",
  },
];

export function FeatureSlideshow({
  eyebrow = "CÓMO FUNCIONA",
  title = "Solo 3 pasos para empezar",
  subtitle = "Una experiencia simplificada al máximo inspirada en la interacción fluida del ecosistema iOS.",
  steps = DEFAULT_STEPS,
  className,
}: FeatureSlideshowProps) {
  const [activeStep, setActiveStep] = useState(0);

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
        {/* Left Column - Steps selector */}
        <div className="lg:col-span-5 space-y-3 relative">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "w-full text-left p-4 rounded-[var(--radius-md)] border transition-all duration-300 relative flex items-start gap-3.5 cursor-pointer",
                  isActive
                    ? "bg-[var(--surface-3)] border-[var(--border-strong)] shadow-[var(--shadow-sm)]"
                    : "bg-transparent border-transparent hover:bg-[var(--surface-2)]/60"
                )}
              >
                {/* Accent line on left when active */}
                <span
                  className={cn(
                    "absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all duration-300",
                    isActive ? "bg-[var(--app-primary)] opacity-100" : "bg-transparent opacity-0"
                  )}
                />

                {step.icon && (
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors mt-0.5",
                      isActive
                        ? "bg-[color-mix(in_oklab,var(--app-primary)_15%,transparent)] text-[var(--app-primary)] border border-[var(--app-primary)]/20 shadow-[var(--shadow-sm)]"
                        : "bg-[var(--surface-3)] border border-[var(--border-strong)] text-[var(--text-muted)]"
                    )}
                  >
                    <AppIcon icon={step.icon} className="h-4.5 w-4.5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {step.badge && (
                    <span className="inline-block rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[0.62rem] font-bold text-[var(--text-muted)] border border-[var(--border-strong)]/60 mb-1">
                      {step.badge}
                    </span>
                  )}
                  <h3 className="text-[0.92rem] font-bold text-[var(--text-primary)] tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[0.78rem] text-[var(--text-muted)] mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column - Interactive Device / Screen Preview */}
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
                /* Built-in default mockup visuals if no custom preview image/content passed */
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

                  {activeStep === 0 && (
                    <div className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 flex items-center gap-3.5 shadow-[var(--shadow-sm)]">
                      <div className="h-11 w-11 rounded-full bg-[color-mix(in_oklab,var(--app-primary)_12%,transparent)] flex items-center justify-center text-[var(--app-primary)] border border-[var(--app-primary)]/10 shrink-0">
                        <MapPin className="h-5.5 w-5.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.82rem] font-bold text-[var(--text-primary)] truncate">
                          Clínicas y Salones Cercanos
                        </p>
                        <p className="text-[0.72rem] text-[var(--text-muted)] truncate mt-0.5">
                          {currentStep.previewDescription || "Resultados ordenados por distancia."}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="space-y-2.5">
                      <div className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3 flex justify-between items-center shadow-[var(--shadow-sm)]">
                        <div>
                          <p className="text-[0.78rem] font-bold text-[var(--text-primary)]">
                            Masaje Relajante
                          </p>
                          <p className="text-[0.68rem] text-[var(--text-muted)]">60 minutos</p>
                        </div>
                        <span className="text-[0.82rem] font-bold text-[var(--app-primary)]">
                          $45.000
                        </span>
                      </div>
                      <div className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3 flex justify-between items-center opacity-60">
                        <div>
                          <p className="text-[0.78rem] font-bold text-[var(--text-primary)]">
                            Limpieza Facial
                          </p>
                          <p className="text-[0.68rem] text-[var(--text-muted)]">45 minutos</p>
                        </div>
                        <span className="text-[0.82rem] font-semibold text-[var(--text-primary)]">
                          $35.000
                        </span>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 space-y-2.5 shadow-[var(--shadow-sm)]">
                      <div className="flex items-center gap-2 text-[var(--color-success)]">
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span className="text-[0.8rem] font-bold">Cita Confirmada</span>
                      </div>
                      <p className="text-[0.75rem] text-[var(--text-muted)] leading-relaxed">
                        Mañana a las 03:30 PM · Barba & Corte en Estética Aura
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

