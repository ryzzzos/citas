"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { loginDemoUser } from "@/lib/api/auth";

const EASE_APPLE = [0.32, 0.72, 0, 1] as const;

interface DemoLoginButtonProps {
  className?: string;
}

export default function DemoLoginButton({ className }: DemoLoginButtonProps) {
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
      <Button
        variant="interactive"
        onClick={handleDemoLogin}
        disabled={loading}
        className={className}
      >
        <span>{loading ? "Cargando..." : "Modo Demo"}</span>
      </Button>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25, ease: EASE_APPLE }}
            className="mt-2 text-[0.72rem] text-[var(--color-error)] font-semibold"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Full-screen loading overlay */}
      <AnimatePresence>
        {loading && <LoadingModal />}
      </AnimatePresence>
    </>
  );
}

function LoadingModal() {
  return (
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
  );
}
