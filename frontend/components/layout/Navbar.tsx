"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  Compass,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Search,
  SlidersHorizontal,
  Store,
  User as UserIcon,
  UserRoundCheck,
  X,
} from "lucide-react";

import AppIcon from "@/components/ui/AppIcon";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import BrandLogo from "@/components/ui/BrandLogo";
import { getMe, getMyBusiness, logout } from "@/lib/api";
import type { User } from "@/types";
import { useDiscoverySearch } from "@/components/sucursales/DiscoverySearchContext";
import type { DiscoveryFilters } from "@/components/sucursales/types";
import CustomSelect from "@/components/ui/CustomSelect";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type SessionState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authenticated"; user: User; onboardingPending: boolean };

const MAX_AUTOCOMPLETE_RESULTS = 5;

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

/* ── Tiny avatar for autocomplete ───────────────────────────── */

function ResultAvatar({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  const [errored, setErrored] = useState(false);
  const show = Boolean(logoUrl && !errored);

  return (
    <div className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-strong)]">
      {show ? (
        <Image
          src={logoUrl as string}
          alt={name}
          fill
          sizes="32px"
          className="object-cover"
          unoptimized
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="text-[0.5rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {toInitials(name)}
        </span>
      )}
    </div>
  );
}

/* ── Navbar Component ───────────────────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isIntroActive, setIsIntroActive] = useState(() => pathname === "/");

  useEffect(() => {
    if (isIntroActive) {
      const timer = setTimeout(() => {
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

  /* ── Morphing Search State ────────────────────────────────── */
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(true);

  const navbarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* ── Discovery Search Context ─────────────────────────────── */
  const ctx = useDiscoverySearch();
  const items = ctx?.items ?? [];
  const filters = ctx?.filters ?? { city: "", category: "" };
  const onFiltersChange = ctx?.onFiltersChange;
  const onSelectBusiness = ctx?.onSelectBusiness;
  const loading = ctx?.loading ?? false;

  const categories = ctx
    ? ["", ...Array.from(new Set(items.map((item) => item.category))).sort((a, b) => a.localeCompare(b, "es"))]
    : [];

  const results = ctx
    ? query.trim().length === 0
      ? []
      : items
          .filter((biz) =>
            `${biz.name} ${biz.category} ${biz.city} ${biz.address}`
              .toLocaleLowerCase("es")
              .includes(query.trim().toLocaleLowerCase("es")),
          )
          .slice(0, MAX_AUTOCOMPLETE_RESULTS)
    : [];

  const hasActiveFilters = filters.city.trim().length > 0 || filters.category.trim().length > 0;

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

  // Click outside listener for user menu AND search panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
        if (searchExpanded) {
          setSearchExpanded(false);
          setQuery("");
          setFiltersVisible(false);
        }
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        if (searchExpanded) {
          setSearchExpanded(false);
          setQuery("");
          setFiltersVisible(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchExpanded]);

  const handleLogout = useCallback(() => {
    logout();
    setSession({ status: "guest" });
    setUserMenuOpen(false);
    router.push("/");
  }, [router]);

  const handleSelectResult = useCallback(
    (businessId: string) => {
      onSelectBusiness?.(businessId);
      setSearchExpanded(false);
      setQuery("");
      setFiltersVisible(false);
    },
    [onSelectBusiness],
  );

  const handleFilterChange = useCallback(
    (patch: Partial<DiscoveryFilters>) => {
      onFiltersChange?.({ ...filters, ...patch });
    },
    [filters, onFiltersChange],
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange?.({ city: "", category: "" });
    setQuery("");
  }, [onFiltersChange]);

  const openSearch = useCallback(() => {
    setSearchExpanded(true);
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, []);

  if (hideOnDashboard) {
    return null;
  }

  const navItemClassName = cn(
    "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-1.5",
    "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
    "whitespace-nowrap transition-colors duration-200",
    "glass-floating",
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
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[9998] bg-[var(--surface-1)] pointer-events-auto"
          />
        )}
        {isIntroActive && (
          <div
            key="splash-logo-container"
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              layoutId="navbar-brand-logo-svg"
              transition={{ duration: 1.0, ease: [0.32, 0.72, 0, 1] }}
              className="pointer-events-auto w-[160px] h-[176px]"
            >
              <BrandLogo size={160} variant="icon" className="w-full h-full" containerClassName="w-full h-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <header
        className={cn(
          "z-[760] px-4 pt-[max(env(safe-area-inset-top),0.45rem)] md:px-6",
          isMapRoute ? "fixed inset-x-0 top-0 pb-0" : "sticky top-0 pb-1",
        )}
      >
        <div
          ref={navbarRef}
          className={cn(
            "pointer-events-auto mx-auto flex h-14 items-center justify-between gap-3 rounded-full px-3.5 sm:px-6 w-full transition-all duration-300",
            isMapRoute ? "max-w-[78rem]" : "max-w-6xl",
            "bg-[var(--surface-glass)] shadow-[var(--shadow-md)] backdrop-blur-md border border-[var(--border-strong)]",
          )}
        >
          {/* Logo/Brand */}
          <Link
            href="/"
            onClick={() => setSearchExpanded(false)}
            className="dashboard-focusable rounded-full px-1.5 shrink-0 flex items-center justify-center h-full"
          >
            <div className="inline-flex items-center gap-2 select-none">
              <div className="relative w-9 h-[39.6px] flex items-center justify-center shrink-0">
                {!isIntroActive && (
                  <motion.div
                    layoutId="navbar-brand-logo-svg"
                    transition={{ duration: 1.0, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0 w-9 h-[39.6px] flex items-center justify-center"
                  >
                    <BrandLogo size={36} variant="icon" className="w-full h-full" containerClassName="w-full h-full" />
                  </motion.div>
                )}
              </div>
              <motion.div
                initial={isIntroActive ? { opacity: 0, x: -6 } : { opacity: 1, x: 0 }}
                animate={!isIntroActive ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="flex items-baseline leading-none font-sans text-[1.22rem] tracking-tight"
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

        {/* ── CENTER ELONGATED SEARCH CAPSULE & COMBOBOX ── */}
        {isMapRoute && ctx && (
          <div className="flex-1 max-w-md mx-2 relative">
            {/* Input Capsule Box */}
            <div
              className={cn(
                "flex h-10 items-center gap-2 rounded-full px-3.5 bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-primary)] w-full transition-all duration-300",
                searchExpanded && "bg-[var(--surface-3)] border-[var(--app-primary)]/35 shadow-[var(--shadow-sm)]"
              )}
            >
              <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={openSearch}
                placeholder="Buscar sucursal..."
                className="flex-1 bg-transparent text-[0.82rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
              {(query.trim() || hasActiveFilters) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilters();
                  }}
                  className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {searchExpanded && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchExpanded(false);
                    setQuery("");
                    setFiltersVisible(false);
                  }}
                  className="shrink-0 text-[0.72rem] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1 transition-colors"
                >
                  Cerrar
                </button>
              )}
            </div>

            {/* Dropdown Combobox panel hanging directly under capsule */}
            {searchExpanded && (
              <div
                className={cn(
                  "absolute top-[calc(100%+0.5rem)] left-0 w-full z-[800] p-3 flex flex-col gap-3 rounded-[var(--radius-lg)]",
                  "bg-[var(--surface-3)] shadow-[var(--shadow-lg)] border border-[var(--border-strong)] backdrop-blur-3xl",
                  "animate-in fade-in slide-in-from-top-2 duration-200"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Filters pill row */}
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiltersVisible((v) => !v);
                    }}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-[3px] text-[0.65rem] font-semibold transition-all duration-200",
                      filtersVisible
                        ? "bg-[var(--app-primary)] text-white"
                        : "bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--surface-3)]",
                    )}
                  >
                    <SlidersHorizontal className="h-2.5 w-2.5" />
                    Filtros
                  </button>

                  {filters.city && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[0.65rem] font-semibold bg-[color-mix(in_oklab,var(--color-info)_10%,transparent)] text-[var(--color-info)] border border-[var(--color-info)]/15">
                      <MapPin className="h-2.5 w-2.5" />
                      {filters.city}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange({ city: "" });
                        }}
                        className="ml-0.5 hover:opacity-70"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </span>
                  )}

                  {filters.category && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[0.65rem] font-semibold bg-[color-mix(in_oklab,var(--color-success)_10%,transparent)] text-[var(--color-success)] border border-[var(--color-success)]/15">
                      {filters.category}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange({ category: "" });
                        }}
                        className="ml-0.5 hover:opacity-70"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </span>
                  )}
                </div>

                {/* Collapsible Inputs */}
                {filtersVisible && (
                  <div className="grid grid-cols-2 gap-2.5 pb-2 border-b border-[var(--border-strong)]/20 shrink-0 animate-in slide-in-from-top-1 duration-200">
                    <label className="space-y-0.5">
                      <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Ciudad
                      </span>
                      <input
                        type="text"
                        value={filters.city}
                        onChange={(e) => handleFilterChange({ city: e.target.value })}
                        placeholder="Ej: Medellín"
                        className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-2.5 py-1 text-[0.75rem] text-[var(--text-primary)] outline-none focus:border-[var(--app-primary)] placeholder:text-[var(--text-muted)]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </label>
                    <div className="space-y-0.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Categoría
                      </span>
                      <CustomSelect<string>
                        value={filters.category}
                        onChange={(val) => handleFilterChange({ category: val })}
                        options={categories.map((cat) => ({
                          value: cat,
                          label: cat || "Todas",
                        }))}
                        buttonClassName="!h-[26px] !py-0.5 !px-2 !rounded-[var(--radius-sm)] !text-[0.75rem] !bg-[var(--surface-2)] font-semibold"
                        menuClassName="!rounded-[var(--radius-sm)]"
                      />
                    </div>
                  </div>
                )}

                {/* Results List */}
                <div className="flex-1 overflow-y-auto max-h-[220px] pr-0.5 space-y-1">
                  {loading && results.length === 0 && query.trim().length > 0 && (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
                    </div>
                  )}

                  {query.trim().length === 0 && (
                    <div className="text-center py-6 text-[0.78rem] text-[var(--text-muted)]">
                      <Search className="h-4 w-4 mx-auto opacity-30 mb-1" />
                      <p>Escribe para buscar sucursales...</p>
                    </div>
                  )}

                  {query.trim().length > 0 && results.length === 0 && !loading && (
                    <div className="text-center py-6">
                      <Search className="h-4 w-4 mx-auto text-[var(--text-muted)] opacity-40 mb-1" />
                      <p className="text-[0.75rem] font-semibold text-[var(--text-primary)]">Sin resultados</p>
                    </div>
                  )}

                  {results.map((biz) => (
                    <button
                      key={biz.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectResult(biz.id);
                      }}
                      className="w-full flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left hover:bg-[var(--surface-2)] transition-colors group"
                    >
                      <ResultAvatar logoUrl={biz.logo_image_url} name={biz.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.78rem] font-semibold text-[var(--text-primary)] group-hover:text-[var(--app-primary)] transition-colors">
                          {biz.name}
                        </p>
                        <p className="truncate text-[0.65rem] text-[var(--text-muted)]">
                          {biz.category} · {biz.city}
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-60 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation list & Actions on the right side */}
        <motion.div
          initial={isIntroActive ? { opacity: 0, y: -4 } : { opacity: 1, y: 0 }}
          animate={!isIntroActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="flex items-center gap-2 shrink-0"
        >
          {/* Main scrollable nav list */}
          <nav className="flex items-center gap-2 overflow-x-auto text-sm font-medium [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(isGuest || isLoading) && !searchExpanded && (
              <Link
                href="/sucursales"
                className={cn(
                  navItemClassName,
                  isMapRoute
                    ? "border-[color:var(--app-primary)] text-[color:var(--text-primary)] shadow-[var(--shadow-sm)]"
                    : undefined,
                )}
              >
                <AppIcon icon={Store} className="mr-1.5 inline" />
                Sucursales
              </Link>
            )}
          </nav>

          {/* Action Group (Kept outside the scrollable nav to prevent dropdown clipping) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme toggler */}
            <AnimatedThemeToggler
              className={cn(
                "dashboard-focusable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2",
                "text-[color:var(--text-secondary)] focus-visible:ring-[color:var(--app-primary)]",
                "glass-floating-muted",
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
                  "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-1.5",
                  "text-[color:var(--text-primary)] hover:text-[color:var(--text-secondary)]",
                  "whitespace-nowrap transition-colors duration-200",
                  "glass-floating",
                )}
              >
                <AppIcon icon={LogIn} />
                Iniciar sesión
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
                    "inline-flex h-10 items-center gap-2 rounded-full pl-1 pr-3 transition-all duration-200",
                    "glass-floating",
                    userMenuOpen
                      ? "bg-[var(--surface-3)] border border-[var(--app-primary)]/30 shadow-[var(--shadow-sm)]"
                      : "hover:bg-[var(--surface-2)]",
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
                {userMenuOpen && (
                  <div
                    className={cn(
                      "absolute right-0 top-full mt-2 w-56 rounded-[var(--radius-lg)] overflow-hidden z-[800]",
                      "bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-lg)]",
                      "animate-in fade-in slide-in-from-top-2 duration-200",
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
                        className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[0.8rem] font-medium text-[var(--color-error)] hover:bg-[color-mix(in_oklab,var(--color-error)_8%,transparent)] transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </header>
    </>
  );
}
