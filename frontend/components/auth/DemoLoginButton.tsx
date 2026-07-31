"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loginDemoUser } from "@/lib/api/auth";

const EASE_APPLE = [0.32, 0.72, 0, 1] as const;

/**
 * A sleek CTA button placed in the landing footer that triggers
 * the demo-login flow: seeds live bookings, authenticates, and
 * redirects to the owner dashboard.
 */
export default function DemoLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDemoLogin() {
    setLoading(true);
    setError(null);

    try {
      await loginDemoUser();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar la demo.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={loading}
        className="group relative inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] px-5 py-2.5 text-[0.78rem] font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] hover:shadow-[var(--shadow-md)] hover:border-[var(--app-primary)]/40 active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
      >
        {/* Pulse dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-success)] opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
        </span>

        {loading ? "Preparando demo..." : "Probar Modo Demo"}

        {/* Arrow */}
        <svg
          className="h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--app-primary)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25, ease: EASE_APPLE }}
            className="mt-2 text-[0.72rem] text-[var(--color-error)]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Full-screen loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_APPLE }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--surface-0)]/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_APPLE }}
              className="flex flex-col items-center gap-5 rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-10 py-8 shadow-[var(--shadow-lg)]"
            >
              {/* Spinner */}
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-full border-[3px] border-[var(--border-strong)]" />
                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[var(--app-primary)]" />
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Cargando entorno Demo
                </p>
                <p className="mt-1 text-[0.75rem] text-[var(--text-muted)]">
                  Generando citas y datos en tiempo real...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
