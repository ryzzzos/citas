"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import FinalCTASection from "@/components/landing/FinalCTASection";
import DemoLoginButton from "@/components/auth/DemoLoginButton";
import { KineticText } from "@/components/ui/KineticText";
import BrandLogo from "@/components/ui/BrandLogo";
import Safari from "@/components/ui/Safari";
import FeatureSlideshow from "@/components/landing/FeatureSlideshow";
import PricingSection from "@/components/landing/PricingSection";
import LandingFaqSection from "@/components/landing/LandingFaqSection";
import { LightRays } from "@/components/ui/LightRays";
import { InfiniteMarquee } from "@/components/ui/InfiniteMarquee";
import { listBusinesses } from "@/lib/api/businesses";
import type { Business } from "@/types";

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
      .catch(() => { });
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
      <section className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 pt-16 sm:pt-28 pb-10 sm:pb-16 text-center flex flex-col items-center overflow-hidden">
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="text-[1.85rem] sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] max-w-3xl leading-[1.1] flex flex-col items-center gap-1 sm:gap-1.5"
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
            className="mt-4 sm:mt-6 text-[0.85rem] sm:text-[1.05rem] leading-relaxed text-[var(--text-muted)] max-w-xl"
          >
            Permite a tus clientes reservar en línea 24/7 sin llamadas ni confusiones.
            Controla tu agenda, sucursales y equipo en un solo lugar con una interfaz intuitiva y profesional.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: [0.32, 0.72, 0, 1] }}
            className="mt-8 flex flex-row gap-2.5 sm:gap-3 w-full sm:w-auto"
          >
            <Link
              href="/auth/register"
              className="inline-flex h-11 sm:h-12 flex-1 sm:flex-initial items-center justify-center rounded-full bg-primary-gradient px-4 sm:px-7 text-[0.8rem] sm:text-sm font-semibold text-white shadow-[var(--shadow-md)] hover:brightness-110 active:scale-98 transition-all duration-200"
            >
              Registra tu negocio
            </Link>
            <Link
              href="/sucursales"
              className="inline-flex h-11 sm:h-12 flex-1 sm:flex-initial items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-4 sm:px-7 text-[0.8rem] sm:text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-2)] active:scale-98 transition-all duration-200"
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
        className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 pb-12 sm:pb-24 group"
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
            speed={100}
            pauseOnHover={true}
          />
        </section>
      )}

      {/* ── FEATURE SLIDESHOW SECTION ───────────────────────── */}
      <FeatureSlideshow />

      {/* ── PRICING SECTION ────────────────────────────────── */}
      <PricingSection />

      {/* ── FAQ SECTION ──────────────────────────────────────── */}
      <LandingFaqSection />

      {/* ── FINAL HIGH-IMPACT CTA SECTION ────────────────────── */}
      <FinalCTASection />

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-strong)]/40 bg-[var(--surface-3)]/60 py-8 sm:py-12 px-6 text-center text-[0.72rem] text-[var(--text-muted)] flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <BrandLogo size={28} />
          <DemoLoginButton />
        </div>
        <p>© {new Date().getFullYear()} Agenda Web. Todos los derechos reservados. Diseñado para simplificar tu día.</p>
      </footer>
    </main>
  );
}
