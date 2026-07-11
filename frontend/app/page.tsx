"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  MapPin,
  Shield,
  Smartphone,
  Star,
  Users,
  Store,
  Plus,
  Minus,
} from "lucide-react";

import AppIcon from "@/components/ui/AppIcon";
import { KineticText } from "@/components/ui/KineticText";
import BrandLogo from "@/components/ui/BrandLogo";
import Safari from "@/components/ui/Safari";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ── Interactive Demo Steps ────────────────────────────────── */

const DEMO_STEPS = [
  {
    id: "step-1",
    title: "1. Busca un local",
    description: "Explora salones, barberías, spas o centros médicos cercanos en el mapa interactivo.",
    badge: "B2C Marketplace",
    icon: MapPin,
  },
  {
    id: "step-2",
    title: "2. Elige el servicio",
    description: "Selecciona el servicio que deseas, revisa el precio, duración y el especialista de tu preferencia.",
    badge: "Transparencia Total",
    icon: Calendar,
  },
  {
    id: "step-3",
    title: "3. Reserva al instante",
    description: "Escoge una hora disponible y confirma. Sin llamadas telefónicas ni tiempos de espera.",
    badge: "Confirmación 24/7",
    icon: Clock,
  },
];

/* ── FAQ Accordion Items ────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    question: "¿Tiene algún costo para los clientes?",
    answer: "No, para los clientes finales es 100% gratis. Puedes buscar, cotizar y agendar tus citas en cualquier negocio registrado sin cargos adicionales.",
  },
  {
    question: "¿Cómo funciona la cuenta para dueños de negocios?",
    answer: "Si eres emprendedor o dueño de negocio, puedes registrar tu local en segundos. Podrás definir tus servicios, sucursales, horarios de atención de tu personal y administrar la agenda en tiempo real desde tu panel administrativo.",
  },
  {
    question: "¿El sistema evita que dos clientes reserven a la misma hora?",
    answer: "Sí, nuestro motor de reservas valida en tiempo real la disponibilidad del especialista asignado y de la sucursal antes de confirmar, garantizando cero conflictos de sobre-reserva.",
  },
  {
    question: "¿Es amigable con dispositivos móviles?",
    answer: "Totalmente. Toda la plataforma está diseñada con enfoque 'Mobile-First', inspirada en la sencillez de los sistemas iOS y Android, ideal tanto para tus clientes como para tus colaboradores.",
  },
];

/* ── Bento Grid Features ────────────────────────────────────── */

const BENTO_FEATURES = [
  {
    title: "Agenda en tiempo real",
    desc: "Un calendario intuitivo diario, semanal o mensual diseñado para operar rápidamente en tabletas y móviles sin fricción.",
    icon: Calendar,
    className: "col-span-1 md:col-span-2",
    decor: (
      <div className="mt-4 flex flex-col gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3.5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between border-b border-[var(--border-strong)]/40 pb-2">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">Hoy, 10:30 AM</span>
          <span className="rounded-full bg-[color-mix(in_oklab,var(--color-success)_10%,transparent)] px-2 py-0.5 text-[0.6rem] font-bold text-[var(--color-success)] border border-[var(--color-success)]/10">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--app-primary)]" />
          <span className="text-[0.8rem] font-semibold text-[var(--text-primary)]">Corte de Cabello Premium</span>
        </div>
        <span className="text-[0.7rem] text-[var(--text-muted)]">Especialista: Adrian M. · 45 min</span>
      </div>
    ),
  },
  {
    title: "Cero Doble Reserva",
    desc: "Validación de slots segundo a segundo en base a la agenda real de tus estilistas y profesionales.",
    icon: Shield,
    className: "col-span-1",
    decor: (
      <div className="mt-4 flex items-center justify-center py-4">
        <div className="relative flex items-center justify-center h-14 w-14 rounded-full bg-[color-mix(in_oklab,var(--color-success)_8%,transparent)] text-[var(--color-success)] border border-[var(--color-success)]/20 shadow-[var(--shadow-sm)]">
          <CheckCircle className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--color-success)] animate-ping" />
        </div>
      </div>
    ),
  },
  {
    title: "Marketplace Abierto",
    desc: "Tus clientes te encuentran y reservan directamente. Aumenta tu alcance local.",
    icon: Compass,
    className: "col-span-1",
    decor: (
      <div className="mt-4 flex flex-col gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-[var(--app-primary)]" />
          <span className="text-[0.75rem] font-bold text-[var(--text-primary)]">Estetica Aura Laureles</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-[0.7rem] font-semibold text-[var(--text-secondary)]">4.9 (124 valoraciones)</span>
        </div>
      </div>
    ),
  },
  {
    title: "Mobile First",
    desc: "Perfecto para tablets, celulares y computadores. Tus clientes reservan desde el sillón de su casa en segundos.",
    icon: Smartphone,
    className: "col-span-1 md:col-span-2",
    decor: (
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-strong)] p-2 text-center shadow-[var(--shadow-sm)]">
          <Clock className="h-4 w-4 mx-auto text-[var(--color-info)] mb-1" />
          <span className="text-[0.6rem] font-medium text-[var(--text-muted)]">Rápido</span>
        </div>
        <div className="rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-strong)] p-2 text-center shadow-[var(--shadow-sm)]">
          <Users className="h-4 w-4 mx-auto text-[var(--color-pending)] mb-1" />
          <span className="text-[0.6rem] font-medium text-[var(--text-muted)]">Colaborativo</span>
        </div>
        <div className="rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-strong)] p-2 text-center shadow-[var(--shadow-sm)]">
          <Star className="h-4 w-4 mx-auto text-amber-500 mb-1" />
          <span className="text-[0.6rem] font-medium text-[var(--text-muted)]">Premium</span>
        </div>
      </div>
    ),
  },
];

/* ── FAQ Component ─────────────────────────────────────────── */

function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--border-strong)]/40 last:border-b-0 py-3.5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left font-semibold text-[0.92rem] text-[var(--text-primary)] hover:text-[var(--app-primary)] transition-colors py-1 cursor-pointer"
      >
        <span>{question}</span>
        {open ? (
          <Minus className="h-4 w-4 text-[var(--app-primary)] shrink-0 ml-2" />
        ) : (
          <Plus className="h-4 w-4 text-[var(--text-muted)] shrink-0 ml-2" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-[0.82rem] leading-relaxed text-[var(--text-muted)] pt-2 pb-1">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── HomePage Component ─────────────────────────────────────── */

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className="min-h-screen bg-[var(--surface-1)] text-[var(--text-primary)] overflow-x-hidden">
      {/* ── BACKGROUND GLOWS ─────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[color-mix(in_oklab,var(--app-primary)_8%,transparent)] to-transparent pointer-events-none z-0" />

      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-3.5 py-1 text-[0.7rem] font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] animate-pulse" />
          Plataforma B2C e Inteligencia de Agendamiento
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] max-w-3xl leading-[1.1] flex flex-col items-center gap-1.5"
        >
          <KineticText
            text="Gestiona tu agenda,"
            as="span"
            className="justify-center"
          />
          <KineticText
            text="haz crecer tu negocio"
            as="span"
            className="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-strong)] bg-clip-text text-transparent justify-center"
          />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-[0.95rem] sm:text-[1.05rem] leading-relaxed text-[var(--text-muted)] max-w-xl"
        >
          Permite a tus clientes reservar en línea 24/7 sin llamadas ni confusiones. 
          Controla tu agenda y sucursales en un solo lugar con diseño Apple-First.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Link
            href="/auth/register"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary-gradient px-7 text-sm font-semibold text-white shadow-[var(--shadow-md)] hover:brightness-110 active:scale-98 transition-all duration-200"
          >
            Registra tu negocio
          </Link>
          <Link
            href="/sucursales"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-7 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-2)] active:scale-98 transition-all duration-200"
          >
            Explorar sucursales
          </Link>
        </motion.div>
      </section>

      {/* Safari Browser Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 pb-16"
      >
        <Safari
          url="agendaweb.com"
          imageSrc="/dashboard-mock.webp"
          imageSrcDark="/dashboard-mock-dark.webp"
        />
      </motion.div>

      {/* ── INTERACTIVE MOCKUP SECTION ──────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] p-6 sm:p-8 shadow-[var(--shadow-md)]">
          
          {/* Steps Left Selector */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              ¿Cómo funciona?
            </h2>
            <p className="text-[0.82rem] text-[var(--text-muted)] leading-relaxed mb-4">
              Una experiencia simplificada al máximo inspirada en la interacción fluida del ecosistema iOS.
            </p>

            <div className="space-y-3">
              {DEMO_STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-[var(--radius-sm)] border transition-all duration-300 flex items-start gap-3 cursor-pointer",
                      isActive
                        ? "bg-[var(--surface-3)] border-[var(--app-primary)]/30 shadow-[var(--shadow-sm)]"
                        : "bg-transparent border-transparent hover:bg-[var(--surface-3)]/40"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        isActive
                          ? "bg-[var(--app-primary)] text-white"
                          : "bg-[var(--surface-3)] border border-[var(--border-strong)] text-[var(--text-muted)]"
                      )}
                    >
                      <AppIcon icon={step.icon} className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[0.6rem] font-bold text-[var(--text-muted)] border border-[var(--border-strong)]/60">
                        {step.badge}
                      </span>
                      <h4 className="text-[0.85rem] font-bold text-[var(--text-primary)] mt-1">{step.title}</h4>
                      <p className="text-[0.75rem] text-[var(--text-muted)] mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Device Screen Preview */}
          <div className="lg:col-span-3 h-[320px] rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] overflow-hidden relative p-6 flex flex-col justify-center items-center">
            {/* Soft grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm flex flex-col gap-3 z-10"
                >
                  <span className="text-[0.65rem] font-bold text-[var(--app-primary)] uppercase tracking-wider">Paso 1: Localización</span>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Mapa y Filtros en Vivo</h3>
                  
                  {/* Map mockup widget */}
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[color-mix(in_oklab,var(--app-primary)_12%,transparent)] flex items-center justify-center text-[var(--app-primary)] border border-[var(--app-primary)]/10">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.78rem] font-bold text-[var(--text-primary)] truncate">Clinicas y Salones Cercanos</p>
                      <p className="text-[0.68rem] text-[var(--text-muted)] truncate">Resultados ordenados por distancia en tu ciudad.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm flex flex-col gap-3 z-10"
                >
                  <span className="text-[0.65rem] font-bold text-[var(--color-success)] uppercase tracking-wider">Paso 2: Selección</span>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Servicios Personalizados</h3>
                  
                  {/* Service list mockup */}
                  <div className="space-y-2">
                    <div className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-2.5 flex justify-between items-center">
                      <div>
                        <p className="text-[0.75rem] font-bold text-[var(--text-primary)]">Masaje Relajante</p>
                        <p className="text-[0.65rem] text-[var(--text-muted)]">60 minutos</p>
                      </div>
                      <span className="text-[0.78rem] font-semibold text-[var(--text-primary)]">$45.000</span>
                    </div>
                    <div className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-2.5 flex justify-between items-center opacity-60">
                      <div>
                        <p className="text-[0.75rem] font-bold text-[var(--text-primary)]">Limpieza Facial</p>
                        <p className="text-[0.65rem] text-[var(--text-muted)]">45 minutos</p>
                      </div>
                      <span className="text-[0.78rem] font-semibold text-[var(--text-primary)]">$35.000</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm flex flex-col gap-3 z-10"
                >
                  <span className="text-[0.65rem] font-bold text-[var(--color-pending)] uppercase tracking-wider">Paso 3: Reserva</span>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Cita Confirmada</h3>
                  
                  {/* Ticket/Confirm mockup */}
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-[var(--color-success)] text-[0.75rem] font-bold">
                      <CheckCircle className="h-4 w-4" />
                      <span>¡Reserva Registrada Exitosamente!</span>
                    </div>
                    <div className="border-t border-[var(--border-strong)]/40 pt-2 text-[0.68rem] space-y-1">
                      <div className="flex justify-between"><span className="text-[var(--text-muted)]">Fecha:</span> <span className="font-semibold text-[var(--text-primary)]">Sábado, 5 de Julio</span></div>
                      <div className="flex justify-between"><span className="text-[var(--text-muted)]">Hora:</span> <span className="font-semibold text-[var(--text-primary)]">11:00 AM - 12:00 PM</span></div>
                      <div className="flex justify-between"><span className="text-[var(--text-muted)]">Servicio:</span> <span className="font-semibold text-[var(--text-primary)]">Corte + Barba premium</span></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID FEATURES ──────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Todo lo necesario en una interfaz fluida
          </h2>
          <p className="text-[0.82rem] text-[var(--text-muted)] mt-2">
            Centralizamos los módulos de tu negocio y la reserva de tus clientes sin enredos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BENTO_FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between overflow-hidden",
                feature.className
              )}
            >
              <div>
                <div className="h-9 w-9 rounded-full bg-[color-mix(in_oklab,var(--app-primary)_8%,transparent)] text-[var(--app-primary)] flex items-center justify-center border border-[var(--app-primary)]/10 mb-4">
                  <AppIcon icon={feature.icon} className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-[0.92rem] text-[var(--text-primary)]">{feature.title}</h3>
                <p className="text-[0.78rem] text-[var(--text-muted)] mt-1.5 leading-relaxed">{feature.desc}</p>
              </div>
              {feature.decor}
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Preguntas Frecuentes
          </h2>
          <p className="text-[0.82rem] text-[var(--text-muted)] mt-2">
            Todo lo que necesitas saber sobre el uso y registro en Agenda Web.
          </p>
        </div>

        <div className="bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-[var(--shadow-sm)]">
          {FAQ_ITEMS.map((item, idx) => (
            <FAQAccordionItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      {/* ── FINAL CTA SECTION ────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--surface-3)] to-[var(--surface-2)] border border-[var(--border-strong)] p-8 sm:p-12 text-center shadow-[var(--shadow-md)] overflow-hidden relative">
          {/* Subtle glow behind */}
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--app-primary)_10%,transparent)] blur-3xl pointer-events-none" />

          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            ¿Listo para simplificar tu agenda?
          </h2>
          <p className="text-[0.85rem] text-[var(--text-muted)] mt-3 max-w-md mx-auto leading-relaxed">
            Únete a cientos de salones, consultorios y centros de bienestar que ya automatizan su reserva de citas en línea.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary-gradient px-8 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:brightness-110 transition-all cursor-pointer"
            >
              Comienza gratis hoy
            </Link>
            <Link
              href="/sucursales"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-8 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              Explorar el mapa
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-strong)]/40 bg-[var(--surface-3)]/60 py-8 px-6 text-center text-[0.72rem] text-[var(--text-muted)] flex flex-col items-center justify-center gap-3">
        <BrandLogo size={24} />
        <p>© {new Date().getFullYear()} Agenda Web. Todos los derechos reservados. Diseñado para simplificar tu día.</p>
      </footer>
    </main>
  );
}
