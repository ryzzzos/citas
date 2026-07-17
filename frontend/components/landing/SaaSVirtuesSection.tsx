"use client";

import { motion } from "framer-motion";
import Safari from "@/components/ui/Safari";

export default function SaaSVirtuesSection() {
  return (
    <section className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 py-16 sm:py-24">
      {/* ── SECTION HEADER ─────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-[0.72rem] sm:text-[0.78rem] font-bold tracking-widest uppercase text-[var(--color-warnm)] block mb-2.5"
        >
          SOLUCIÓN SAAS
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]"
        >
          Empodera tu negocio con agendamiento inteligente
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-[0.92rem] sm:text-[1.05rem] text-[var(--text-muted)] leading-relaxed"
        >
          Las herramientas genéricas no bastan. Nuestra plataforma está construida a la medida para brindar soluciones excepcionales de agendamiento para las necesidades únicas de tu negocio.
        </motion.p>
      </div>

      {/* ── BENTO GRID LAYOUT ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        
        {/* ── LEFT COLUMN (Spans 2 cols on lg) ──────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
          
          {/* Row 1: 2 Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Card 1: Algoritmos de Citas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-[var(--radius-2xl)] p-6 sm:p-7 flex flex-col justify-between shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)]/80 transition-all duration-300 overflow-hidden group min-h-[360px]"
            >
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--color-warnm)]">
                  Algoritmos de Citas Avanzados
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Nuestra plataforma optimiza los horarios de atención y asigna citas automáticamente a tu personal sin solapamientos ni llamadas telefónicas.
                </p>
              </div>

              {/* Mockup Preview Container */}
              <div className="mt-6 pt-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-1)] shadow-[var(--shadow-sm)] group-hover:scale-[1.02] transition-transform duration-500">
                <Safari
                  url="agendaweb.com/agenda"
                  imageSrc="/dashboard_ligth.webp"
                  imageSrcDark="/dashboard_dark.webp"
                  className="w-full"
                />
              </div>
            </motion.div>

            {/* Card 2: Resguardo de Datos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-[var(--radius-2xl)] p-6 sm:p-7 flex flex-col justify-between shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)]/80 transition-all duration-300 overflow-hidden group min-h-[360px]"
            >
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--color-warnm)]">
                  Seguridad y Resguardo de Datos
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Priorizamos la seguridad de tu negocio con cifrado de nivel bancario y estrictos protocolos de privacidad en la nube 24/7.
                </p>
              </div>

              {/* Mockup Preview Container */}
              <div className="mt-6 pt-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-1)] shadow-[var(--shadow-sm)] group-hover:scale-[1.02] transition-transform duration-500">
                <Safari
                  url="agendaweb.com/seguridad"
                  imageSrc="/dashboard_ligth.webp"
                  imageSrcDark="/dashboard_dark.webp"
                  className="w-full"
                />
              </div>
            </motion.div>

          </div>

          {/* Row 2: Bottom Wide Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-[var(--radius-2xl)] p-6 sm:p-8 flex flex-col justify-between shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)]/80 transition-all duration-300 overflow-hidden group min-h-[380px]"
          >
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-warnm)]">
                Soluciones Personalizables
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
                Adapta nuestros servicios a las necesidades específicas de tu sucursal con opciones de personalización flexibles, garantizando el máximo rendimiento de tu plataforma.
              </p>
            </div>

            {/* Wide Mockup Preview Container */}
            <div className="mt-6 pt-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-1)] shadow-[var(--shadow-sm)] group-hover:scale-[1.01] transition-transform duration-500">
              <Safari
                url="agendaweb.com/dashboard"
                imageSrc="/dashboard_ligth.webp"
                imageSrcDark="/dashboard_dark.webp"
                className="w-full"
              />
            </div>
          </motion.div>

        </div>

        {/* ── RIGHT COLUMN (Spans 1 col on lg - Tall Card) ──────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-1 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-[var(--radius-2xl)] p-6 sm:p-8 flex flex-col justify-between shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)]/80 transition-all duration-300 overflow-hidden relative group min-h-[500px] lg:min-h-full"
        >
          {/* Soft dot background pattern matching reference design */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-strong)_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="relative z-10">
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-warnm)]">
              Integración y Reserva Fluida
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Integra nuestras soluciones fácilmente en tus procesos existentes para una operación ágil, rápida y fluida tanto en PC como en móviles.
            </p>
          </div>

          {/* Tall Mockup Preview Area */}
          <div className="relative z-10 mt-8 pt-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-1)] shadow-[var(--shadow-md)] group-hover:scale-[1.02] transition-transform duration-500 flex-1 flex flex-col justify-start">
            <Safari
              url="agendaweb.com/reservas"
              imageSrc="/dashboard_ligth.webp"
              imageSrcDark="/dashboard_dark.webp"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
