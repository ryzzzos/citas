"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import FinalCTASection from "@/components/landing/FinalCTASection";
import DemoLoginButton from "@/components/auth/DemoLoginButton";
import { KineticText } from "@/components/ui/KineticText";
import BrandLogo from "@/components/ui/BrandLogo";
import Safari from "@/components/ui/Safari";
import FeatureSlideshow from "@/components/landing/FeatureSlideshow";
import PricingSection from "@/components/landing/PricingSection";
import { LightRays } from "@/components/ui/LightRays";
import { InfiniteMarquee } from "@/components/ui/InfiniteMarquee";
import { listBusinesses } from "@/lib/api/businesses";
import type { Business } from "@/types";
import { cn } from "@/lib/utils";

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
    answer: "Totalmente. Toda la plataforma está diseñada con enfoque 'Mobile-First' y respuesta ultrarrápida, garantizando una navegación intuitiva y sin fricción en cualquier celular, tablet o computador.",
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
  const [dbBusinesses, setDbBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    let active = true;
    listBusinesses()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setDbBusinesses(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const marqueeDisplayItems = dbBusinesses.map((biz) => (
    <Link
      key={biz.id}
      href={`/sucursales?businessId=${biz.id}`}
      className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-300 group cursor-pointer select-none shrink-0"
    >
      {biz.logo_image_url ? (
        <img
          src={biz.logo_image_url}
          alt={biz.name}
          className="h-6 w-6 rounded-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all shrink-0"
        />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)]/60 group-hover:bg-[var(--app-primary)] transition-colors shrink-0" />
      )}
      <span className="text-sm sm:text-base font-bold tracking-wider uppercase opacity-85 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {biz.name}
      </span>
    </Link>
  ));

  return (
    <main className="min-h-screen bg-[var(--surface-1)] text-[var(--text-primary)] overflow-x-hidden">
      <LightRays className="z-0" />
      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 sm:pt-28 pb-12 sm:pb-16 text-center flex flex-col items-center overflow-hidden">
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] max-w-3xl leading-[1.1] flex flex-col items-center gap-1.5"
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85, ease: [0.32, 0.72, 0, 1] }}
            className="mt-6 text-[0.95rem] sm:text-[1.05rem] leading-relaxed text-[var(--text-muted)] max-w-xl"
          >
            Permite a tus clientes reservar en línea 24/7 sin llamadas ni confusiones. 
            Controla tu agenda, sucursales y equipo en un solo lugar con una interfaz intuitiva y profesional.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: [0.32, 0.72, 0, 1] }}
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
        </div>
      </section>

      {/* Safari Browser Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1, ease: [0.32, 0.72, 0, 1] }}
        className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 pb-16 sm:pb-24 group"
      >
        {/* Ambient glow behind Safari */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--app-primary)]/10 to-transparent blur-3xl rounded-[var(--radius-xl)] opacity-50 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none -z-10" />

        <Safari
          url="agendaweb.com"
          imageSrc="/dashboard white.webp"
          imageSrcDark="/dashboard black.webp"
        />
      </motion.div>

      {/* ── INFINITE MARQUEE SECTION ────────────────────────────── */}
      {marqueeDisplayItems.length > 0 && (
        <section className="relative z-10 max-w-6xl mx-auto px-6 py-8 sm:py-12">
          <InfiniteMarquee
            title="NEGOCIOS QUE CONFÍAN EN NOSOTROS"
            items={marqueeDisplayItems}
            speed={45}
            pauseOnHover={true}
          />
        </section>
      )}

      {/* ── FEATURE SLIDESHOW SECTION ───────────────────────── */}
      <FeatureSlideshow />

      {/* ── PRICING SECTION ────────────────────────────────── */}
      <PricingSection />

      {/* ── FAQ SECTION ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-16 sm:py-24">
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

      {/* ── FINAL HIGH-IMPACT CTA SECTION ────────────────────── */}
      <FinalCTASection />

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-strong)]/40 bg-[var(--surface-3)]/60 py-8 sm:py-12 px-6 text-center text-[0.72rem] text-[var(--text-muted)] flex flex-col items-center justify-center gap-4">
        <BrandLogo size={24} />
        <p>© {new Date().getFullYear()} Agenda Web. Todos los derechos reservados. Diseñado para simplificar tu día.</p>
        <div className="w-12 h-px bg-[var(--border-strong)]/60" />
        <DemoLoginButton />
      </footer>
    </main>
  );
}
