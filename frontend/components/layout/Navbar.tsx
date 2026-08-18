"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Store,
  UserRoundCheck,
} from "lucide-react";

import AppIcon from "@/components/ui/AppIcon";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import BrandLogo from "@/components/ui/BrandLogo";
import DynamicSearch from "@/components/ui/DynamicSearch";
import { getMe, getMyBusiness, logout } from "@/lib/api";
import type { User } from "@/types";
import { useDiscoverySearch } from "@/components/sucursales/DiscoverySearchContext";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type SessionState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authenticated"; user: User; onboardingPending: boolean };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isIntroActive, setIsIntroActive] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.sessionStorage.getItem("agenda_web_splash_shown") !== "1";
  });

  useEffect(() => {
    if (isIntroActive) {
      window.sessionStorage.setItem("agenda_web_splash_shown", "1");
      const timer = window.setTimeout(() => {
        setIsIntroActive(false);
      }, 800);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isIntroActive]);
  const hideOnDashboard = pathname.startsWith("/dashboard");
  const isMapRoute = pathname.startsWith("/sucursales");

  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const navbarRef = useRef<HTMLDivElement>(null);

  /* ── Discovery Search Context ─────────────────────────────── */
  const ctx = useDiscoverySearch();

  useEffect(() => {
    if (hideOnDashboard) return;

    let active = true;

    async function loadSessionState(): Promise<void> {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        if (active) setSession({ status: "guest" });
        return;
      }

      try {
        const me = await getMe();
        if (!active) return;

        let onboardingPending = false;

        if (me.role === "business_owner") {
          try {
            await getMyBusiness();
          } catch (error) {
            if (!active) return;
            const detail = error instanceof Error ? error.message : "";
            if (detail === "Business profile not created") {
              onboardingPending = true;
            }
          }
        }

        if (active) {
          setSession({ status: "authenticated", user: me, onboardingPending });
        }
      } catch {
        if (active) setSession({ status: "guest" });
      }
    }

    loadSessionState();

    return () => {
      active = false;
    };
  }, [hideOnDashboard]);

  // Click outside listener for user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setSession({ status: "guest" });
    setUserMenuOpen(false);
    router.push("/");
  }, [router]);

  if (hideOnDashboard) {
    return null;
  }

  const navItemClassName = cn(
    "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium",
    "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[var(--surface-2)]",
    "whitespace-nowrap transition-colors duration-200",
  );

  const isAuthenticated = session.status === "authenticated";
  const isGuest = session.status === "guest";
  const isLoading = session.status === "loading";

  function getUserInitials(): string {
    if (session.status !== "authenticated") return "";
    return session.user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }

  return (
    <>
      <AnimatePresence>
        {isIntroActive && (
          <motion.div
            key="splash-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[color:var(--surface-0)] backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <BrandLogo size={64} variant="icon" />
              <div className="flex items-center gap-1 text-2xl font-bold tracking-tight">
                <span className="text-[color:var(--text-primary)]">Agenda</span>
                <span className="text-[color:var(--text-secondary)] font-light">Web</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={cn(
          "z-[760] px-2.5 sm:px-4 pt-[max(env(safe-area-inset-top),0.45rem)] md:px-6",
          isMapRoute ? "fixed inset-x-0 top-0 pb-0" : "sticky top-0 pb-1",
        )}
      >
        <div
          ref={navbarRef}
          className={cn(
            "pointer-events-auto mx-auto flex h-14 items-center justify-between gap-2 sm:gap-3 rounded-full px-3 sm:px-6 w-full transition-all duration-300",
            isMapRoute ? "max-w-[78rem]" : "max-w-6xl",
            "bg-[var(--surface-glass)] shadow-[var(--shadow-md)] backdrop-blur-md border border-[var(--border-strong)]",
          )}
        >
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="dashboard-focusable group flex items-center gap-2.5 rounded-full p-1 transition-transform active:scale-95 shrink-0"
            aria-label="Ir a la página principal de Agenda Web"
          >
            <div className="relative flex items-center gap-2">
              <motion.div
                initial={isIntroActive ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
                animate={!isIntroActive ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
              >
                <BrandLogo size={36} variant="icon" />
              </motion.div>
              <motion.div
                initial={isIntroActive ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                animate={!isIntroActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="hidden sm:flex items-center text-base tracking-tight"
              >
                <span className="font-bold text-[var(--text-primary)]">
                  Agenda
                </span>
                <span className="font-light text-[var(--text-secondary)]">
                  Web
                </span>
              </motion.div>
            </div>
          </Link>

          {/* Navigation list & Actions on the right side */}
          <motion.div
            initial={isIntroActive ? { opacity: 0, y: -4 } : { opacity: 1, y: 0 }}
            animate={!isIntroActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="flex items-center gap-2 shrink-0"
          >
            {/* Main scrollable nav list */}
            {(isGuest || isLoading) && (
              <motion.nav
                initial={false}
                animate={{
                  width: searchExpanded ? 0 : "auto",
                  opacity: searchExpanded ? 0 : 1,
                }}
                transition={{ type: "spring", stiffness: 420, damping: 35, mass: 0.6 }}
                className="flex items-center overflow-hidden shrink-0 text-sm font-medium"
                style={{ pointerEvents: searchExpanded ? "none" : "auto" }}
              >
                <Link
                  href="/sucursales"
                  className={cn(
                    navItemClassName,
                    isMapRoute
                      ? "bg-[var(--surface-2)] text-[color:var(--text-primary)] border border-[var(--border-strong)] font-semibold"
                      : "border border-transparent",
                  )}
                >
                  <AppIcon icon={Store} size="sm" className="sm:mr-1.5 inline" />
                  <span className="hidden sm:inline">Sucursales</span>
                </Link>
              </motion.nav>
            )}

            {/* ── UNIFIED DYNAMIC SEARCH CAPSULE (Variant small for both PC & Mobile) ── */}
            {isMapRoute && ctx && (
              <DynamicSearch
                variant="small"
                items={ctx.items}
                loading={ctx.loading}
                filters={ctx.filters}
                onFiltersChange={ctx.onFiltersChange}
                onSelectResult={ctx.onSelectBusiness}
                isExpanded={searchExpanded}
                onExpandedChange={setSearchExpanded}
              />
            )}

            {/* Action Group (Hides smoothly on mobile & desktop when search is expanded) */}
            <motion.div
              initial={false}
              animate={{
                width: searchExpanded ? 0 : "auto",
                opacity: searchExpanded ? 0 : 1,
              }}
              transition={{ type: "spring", stiffness: 420, damping: 35, mass: 0.6 }}
              className={cn(
                "flex items-center gap-2 shrink-0",
                searchExpanded ? "overflow-hidden pointer-events-none" : "overflow-visible pointer-events-auto",
              )}
            >
                  {/* Theme toggler */}
                  <AnimatedThemeToggler
                    className={cn(
                      "dashboard-focusable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2",
                      "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[var(--surface-2)] focus-visible:ring-[color:var(--app-primary)] transition-colors duration-200",
                    )}
                    aria-label="Cambiar tema"
                  />

                  {/* Profile Avatar / Login Button */}
                  {isLoading && (
                    <div className="inline-flex min-h-10 w-10 items-center justify-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
                    </div>
                  )}

                  {isGuest && (
                    <Link
                      href="/auth/login"
                      className={cn(
                        "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium",
                        "text-[color:var(--text-primary)] hover:text-[color:var(--text-secondary)] hover:bg-[var(--surface-2)]",
                        "whitespace-nowrap transition-colors duration-200 border border-transparent",
                      )}
                    >
                      <AppIcon icon={LogIn} size="sm" />
                      <span className="hidden sm:inline">Iniciar sesión</span>
                    </Link>
                  )}

                  {isAuthenticated && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserMenuOpen((prev) => !prev);
                        }}
                        className={cn(
                          "inline-flex h-10 items-center gap-2 rounded-full pl-1 pr-3 transition-all duration-200 border cursor-pointer select-none",
                          userMenuOpen
                            ? "bg-[var(--surface-3)] border-[var(--border-strong)]"
                            : "bg-transparent border-transparent hover:bg-[var(--surface-2)]",
                        )}
                        aria-label="Menú de usuario"
                        aria-expanded={userMenuOpen}
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--app-primary)] text-white text-[0.65rem] font-bold tracking-wider shrink-0">
                          {getUserInitials()}
                        </span>
                        <span className="text-[0.8rem] font-semibold text-[var(--text-primary)] hidden sm:inline truncate max-w-[120px]">
                          {session.user.name.split(" ")[0]}
                        </span>
                      </button>

                      {/* User dropdown menu */}
                      <AnimatePresence>
                        {userMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.96 }}
                            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                            className={cn(
                              "absolute right-0 top-full mt-2 w-56 rounded-[var(--radius-lg)] overflow-hidden z-[800]",
                              "bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-lg)]",
                            )}
                          >
                            <div className="px-4 py-3 border-b border-[var(--border-strong)]">
                              <p className="text-[0.82rem] font-semibold text-[var(--text-primary)] truncate">
                                {session.user.name}
                              </p>
                              <p className="text-[0.72rem] text-[var(--text-muted)] truncate mt-0.5">
                                {session.user.email}
                              </p>
                            </div>

                            <div className="p-1.5">
                              {session.user.role === "business_owner" && !session.onboardingPending && (
                                <Link
                                  href="/dashboard"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[0.8rem] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
                                >
                                  <LayoutDashboard className="h-4 w-4" />
                                  Mi panel
                                </Link>
                              )}

                              {session.user.role === "business_owner" && session.onboardingPending && (
                                <Link
                                  href="/onboarding/business"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[0.8rem] font-medium text-[var(--color-pending)] hover:bg-[color-mix(in_oklab,var(--color-pending)_8%,transparent)] transition-colors"
                                >
                                  <UserRoundCheck className="h-4 w-4" />
                                  Completar registro
                                </Link>
                              )}

                              <Link
                                href="/sucursales"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[0.8rem] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
                              >
                                <Store className="h-4 w-4" />
                                Explorar sucursales
                              </Link>

                              <div className="my-1.5 h-px bg-[var(--border-strong)]" />

                              <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[0.8rem] font-medium text-[var(--color-error)] hover:bg-[color-mix(in_oklab,var(--color-error)_8%,transparent)] transition-colors cursor-pointer"
                              >
                                <LogOut className="h-4 w-4" />
                                Cerrar sesión
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
            </motion.div>
            </motion.div>
          </div>
        </header>
      </>
    );
  }
