"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogIn, Store, UserRoundCheck } from "lucide-react";

import AppIcon from "@/components/ui/AppIcon";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { getMe, getMyBusiness } from "@/lib/api";
import { cn, glassRecipes } from "@/lib/utils";

type OnboardingState = "idle" | "pending" | "ready";

export default function Navbar() {
  const pathname = usePathname();
  const hideOnDashboard = pathname.startsWith("/dashboard");
  const isMapRoute = pathname.startsWith("/sucursales");
  const isBranchesRoute = pathname.startsWith("/sucursales");
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

  const navItemClassName = cn(
    "dashboard-focusable inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors",
    "text-[color:var(--dashboard-text-secondary)] hover:text-[color:var(--dashboard-text-primary)]",
    "whitespace-nowrap",
    glassRecipes.floating
  );

  return (
    <header
      className={cn(
        "z-[760] px-4 pt-[max(env(safe-area-inset-top),0.45rem)] md:px-6",
        isMapRoute ? "pointer-events-none fixed inset-x-0 top-0 pb-0" : "sticky top-0 pb-1"
      )}
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex h-14 items-center justify-between gap-3 rounded-[1.35rem] px-3.5 sm:px-6",
          isMapRoute ? "w-full max-w-[78rem]" : "w-full max-w-6xl",
          glassRecipes.island
        )}
      >
        <Link
          href="/"
          className="dashboard-focusable rounded-full px-1.5 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white"
        >
          Agenda Web
        </Link>
        <nav className="flex items-center gap-2 overflow-x-auto text-sm font-medium [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AnimatedThemeToggler
            className={cn(
              "dashboard-focusable inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2",
              "text-[color:var(--dashboard-text-secondary)] focus-visible:ring-[color:var(--dashboard-accent)]",
              glassRecipes.floatingMuted
            )}
            aria-label="Cambiar tema"
          />
          <Link
            href="/sucursales"
            className={cn(
              navItemClassName,
              isBranchesRoute
                ? "border-[color:var(--dashboard-accent)] text-[color:var(--dashboard-text-primary)] shadow-[var(--dashboard-shadow-sm)]"
                : undefined
            )}
          >
            <AppIcon icon={Store} className="mr-1.5 inline" />
            Sucursales
          </Link>
          {onboardingState === "pending" ? (
            <Link href="/onboarding/business" className={navItemClassName}>
              <AppIcon icon={UserRoundCheck} className="mr-1.5 inline" />
              Completar onboarding
            </Link>
          ) : (
            <Link href="/dashboard" className={navItemClassName}>
              <AppIcon icon={LayoutDashboard} className="mr-1.5 inline" />
              Mi panel
            </Link>
          )}
          <Link
            href="/auth/login"
            className={cn(
              "dashboard-focusable inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors",
              "text-[color:var(--dashboard-text-primary)] hover:text-[color:var(--dashboard-text-secondary)]",
              "whitespace-nowrap",
              glassRecipes.floating
            )}
          >
            <AppIcon icon={LogIn} />
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
