"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { getMe, getMyBusiness } from "@/lib/api";

type OnboardingState = "idle" | "pending" | "ready";

export default function Navbar() {
  const pathname = usePathname();
  const hideOnDashboard = pathname.startsWith("/dashboard");
  const [onboardingState, setOnboardingState] = useState<OnboardingState>("idle");

  useEffect(() => {
    if (hideOnDashboard) {
      return;
    }

    let active = true;

    async function loadSessionState(): Promise<void> {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        if (active) setOnboardingState("idle");
        return;
      }

      try {
        const me = await getMe();
        if (!active) return;

        if (me.role !== "business_owner") {
          setOnboardingState("ready");
          return;
        }

        try {
          await getMyBusiness();
          if (active) setOnboardingState("ready");
        } catch (error) {
          if (!active) return;
          const detail = error instanceof Error ? error.message : "";
          setOnboardingState(detail === "Business profile not created" ? "pending" : "ready");
        }
      } catch {
        if (active) setOnboardingState("idle");
      }
    }

    loadSessionState();

    return () => {
      active = false;
    };
  }, [hideOnDashboard]);

  if (hideOnDashboard) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Agenda Web
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <AnimatedThemeToggler
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/80 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Cambiar tema"
          />
          <Link href="/marketplace" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
            Negocios
          </Link>
          {onboardingState === "pending" ? (
            <Link href="/onboarding/business" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              Completar onboarding
            </Link>
          ) : (
            <Link href="/dashboard" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              Mi panel
            </Link>
          )}
          <Link
            href="/auth/login"
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
