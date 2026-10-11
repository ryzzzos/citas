"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "¿Tiene algún costo para los clientes?",
    answer:
      "No, para los clientes finales es 100% gratuito. Puedes buscar negocios, consultar servicios y agendar tus citas en cualquier local registrado sin cobros ocultos ni comisiones añadidas.",
  },
  {
    question: "¿Cómo funciona para dueños de negocios y emprendedores?",
    answer:
      "Puedes registrar tu local en minutos. Podrás configurar tus sedes, tu equipo de trabajo, los servicios con sus duraciones y precios, y gestionar toda la agenda en tiempo real desde un panel claro y sin enredos.",
  },
  {
    question: "¿El sistema evita citas duplicadas o sobre-reservas?",
    answer:
      "Totalmente. Nuestro motor de reservas verifica la disponibilidad en tiempo real tanto del profesional como de la sucursal antes de confirmar, garantizando que nunca se crucen dos clientes en el mismo horario.",
  },
  {
    question: "¿Es amigable y rápido desde cualquier celular?",
    answer:
      "Completamente. Desarrollamos la plataforma con prioridad móvil para que tus clientes puedan agendar con 3 toques y tú puedas revisar tu día al instante desde cualquier teléfono, tablet o computador.",
  },
  {
    question: "¿Necesito ingresar tarjeta de crédito o firmar contrato para empezar?",
    answer:
      "Para nada. Puedes comenzar y configurar tu cuenta sin ingresar datos bancarios ni tarjetas. Queremos que pruebes la experiencia con calma y a tu propio ritmo.",
  },
];

export default function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24 lg:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* ── Left Column: Title, Subtitle & Warm Human Touch ──────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 lg:sticky lg:top-28 space-y-6"
        >
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)]">
            <span className="h-2 w-2 rounded-full bg-[var(--app-primary)] animate-pulse" />
            <span className="text-[0.72rem] sm:text-[0.76rem] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Preguntas frecuentes
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.12]">
              Es normal tener preguntas
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
              Estas son las que haríamos si estuviéramos en tu lugar.
            </p>
          </div>

          {/* Human Philosophy Card */}
          <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[var(--app-primary)] flex items-center justify-center shadow-[var(--shadow-sm)] shrink-0">
                <HelpCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-[0.88rem] font-semibold text-[var(--text-primary)]">
                  ¿Tienes alguna duda específica?
                </h4>
                <p className="text-[0.76rem] text-[var(--text-muted)]">
                  Estamos disponibles para acompañarte
                </p>
              </div>
            </div>
            <p className="text-[0.8rem] text-[var(--text-secondary)] leading-relaxed">
              Queremos que sientas total tranquilidad al elegir cómo coordinar tu tiempo o reservar tus servicios favoritos.
            </p>
            <div className="pt-1">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[var(--app-primary)] hover:underline group"
              >
                <span>Crear cuenta y comenzar gratis</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Right Column: Expandable FAQ Accordion Cards ─────────────── */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className={cn(
                  "rounded-[var(--radius-lg)] border transition-all duration-200 overflow-hidden",
                  isOpen
                    ? "bg-[var(--surface-3)] border-[var(--app-primary)]/40 shadow-[var(--shadow-md)]"
                    : "bg-[var(--surface-3)]/90 hover:bg-[var(--surface-3)] border-[var(--border-strong)] shadow-[var(--shadow-sm)]"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left p-4 sm:p-5 cursor-pointer gap-4 select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-[0.94rem] sm:text-[1rem] text-[var(--text-primary)] leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 shadow-[var(--shadow-sm)]",
                      isOpen
                        ? "bg-[var(--app-primary)] text-white"
                        : "bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-secondary)]"
                    )}
                  >
                    {isOpen ? (
                      <Minus className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-[0.85rem] sm:text-[0.9rem] leading-relaxed text-[var(--text-secondary)] border-t border-[var(--border-strong)]/40">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
