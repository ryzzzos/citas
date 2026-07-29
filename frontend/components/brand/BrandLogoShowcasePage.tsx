"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Layers,
  Maximize2,
  Sliders,
  Sparkles,
  SunMoon,
} from "lucide-react";
import { motion } from "framer-motion";
import BrandLogo from "@/components/ui/BrandLogo";

type LogoVariant = "full" | "icon";
type SurfaceBg = "surface-3" | "surface-2" | "surface-0" | "dark" | "gradient";

export default function BrandLogoShowcasePage() {
  const [size, setSize] = useState<number>(96);
  const [variant, setVariant] = useState<LogoVariant>("full");
  const [showBg, setShowBg] = useState<boolean>(false);
  const [selectedSurface, setSelectedSurface] = useState<SurfaceBg>("surface-2");
  const [copiedCode, setCopiedCode] = useState(false);

  const getSurfaceClass = (surf: SurfaceBg) => {
    switch (surf) {
      case "surface-3":
        return "bg-[var(--surface-3)] text-[var(--text-primary)] border-[var(--border-strong)]";
      case "surface-2":
        return "bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-strong)]";
      case "surface-0":
        return "bg-[var(--surface-0)] text-[var(--text-primary)] border-[var(--border-strong)]";
      case "dark":
        return "bg-[#09090b] text-[#fafafa] border-[rgba(255,255,255,0.12)]";
      case "gradient":
        return "bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#0f172a] text-white border-transparent";
      default:
        return "bg-[var(--surface-2)] border-[var(--border-strong)]";
    }
  };

  const reactSnippet = `<BrandLogo\n  size={${size}}\n  variant="${variant}"${showBg ? "\n  showBg={true}" : ""}\n/>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reactSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--surface-1)] text-[var(--text-primary)] pb-16 selection:bg-[var(--app-primary)]/20">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[var(--surface-3)]/80 backdrop-blur-md border-b border-[var(--border-soft)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </Link>
            <div className="h-4 w-px bg-[var(--border-strong)] hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-info)]/10 text-[var(--color-info)]">
                Brand Assets
              </span>
              <span className="text-sm text-[var(--text-muted)]">
                Guía Visual & Canvas Interactivo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BrandLogo size={28} variant="full" />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* Title Hero */}
        <section className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] text-xs font-medium text-[var(--text-secondary)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            <span>Identidad Visual de AgendaWeb</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Visualizador de Isotipo y Logotipo
          </h1>
          <p className="text-base text-[var(--text-secondary)] max-w-2xl">
            Inspecciona, prueba en diferentes superficies y ajusta los parámetros en tiempo real del componente oficial <code className="text-xs bg-[var(--surface-3)] px-1.5 py-0.5 rounded border border-[var(--border-soft)]">BrandLogo</code>.
          </p>
        </section>

        {/* Interactive Studio Sandbox */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Preview Canvas Area */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className={`relative min-h-[380px] sm:min-h-[440px] rounded-[var(--radius-2xl)] border shadow-[var(--shadow-md)] p-8 flex flex-col items-center justify-center transition-colors duration-300 ${getSurfaceClass(
                selectedSurface
              )}`}
            >
              {/* Top Surface Pill Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="text-xs font-mono opacity-60 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  Size: {size}px
                </span>
                <span className="text-xs font-mono opacity-60 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  Variant: {variant}
                </span>
              </div>

              {/* Rendered Logo */}
              <motion.div
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-[var(--radius-xl)] flex items-center justify-center"
              >
                <BrandLogo size={size} variant={variant} showBg={showBg} />
              </motion.div>

              {/* Surface Switcher */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-3)]/90 backdrop-blur-md border border-[var(--border-strong)] shadow-[var(--shadow-sm)]">
                <SunMoon className="w-3.5 h-3.5 ml-2 text-[var(--text-muted)]" />
                {(
                  [
                    { id: "surface-3", label: "Blanco" },
                    { id: "surface-2", label: "Gris Suave" },
                    { id: "surface-0", label: "Superficie 0" },
                    { id: "dark", label: "Modo Oscuro" },
                    { id: "gradient", label: "Degradado" },
                  ] as const
                ).map((surf) => (
                  <button
                    key={surf.id}
                    onClick={() => setSelectedSurface(surf.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedSurface === surf.id
                        ? "bg-[var(--app-primary)] text-white shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                    }`}
                  >
                    {surf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Snippet Card */}
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] flex items-center justify-between">
              <div className="overflow-x-auto font-mono text-xs text-[var(--text-secondary)] pr-4">
                <span className="text-[var(--color-info)]">import</span> BrandLogo{" "}
                <span className="text-[var(--color-info)]">from</span>{" "}
                <span className="text-[var(--color-success)]">&quot;@/components/ui/BrandLogo&quot;</span>;
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border-strong)] transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--color-success)]" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Copiar React Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-soft)]">
                <Sliders className="w-4 h-4 text-[var(--app-primary)]" />
                <h2 className="font-semibold text-base text-[var(--text-primary)]">
                  Controles de Configuración
                </h2>
              </div>

              {/* Variant Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Variante de Diseño
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-soft)]">
                  <button
                    onClick={() => setVariant("full")}
                    className={`py-2 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${
                      variant === "full"
                        ? "bg-[var(--surface-3)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Completo (Icono + Texto)
                  </button>
                  <button
                    onClick={() => setVariant("icon")}
                    className={`py-2 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${
                      variant === "icon"
                        ? "bg-[var(--surface-3)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Solo Icono
                  </button>
                </div>
              </div>

              {/* Show Background Card Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Contenedor de Fondo (Modo App Icon)
                </label>
                <button
                  onClick={() => setShowBg(!showBg)}
                  className={`w-full py-2.5 px-4 rounded-[var(--radius-lg)] border text-xs font-semibold flex items-center justify-between transition-all ${
                    showBg
                      ? "bg-[var(--app-primary)]/10 border-[var(--app-primary)] text-[var(--app-primary)]"
                      : "bg-[var(--surface-2)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Squircle Card (showBg)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-3)] border border-[var(--border-soft)]">
                    {showBg ? "Activado" : "Desactivado"}
                  </span>
                </button>
              </div>

              {/* Size Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Tamaño en Píxeles ({size}px)
                  </label>
                  <Maximize2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
                <input
                  type="range"
                  min={24}
                  max={240}
                  step={4}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-[var(--app-primary)] cursor-pointer"
                />

                {/* Size Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[24, 36, 48, 64, 96, 128, 192, 240].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSize(preset)}
                      className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium border transition-colors ${
                        size === preset
                          ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)]"
                          : "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-strong)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {preset}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preset Gallery Grid */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Galería de Variaciones de Marca
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Casos de uso comunes en la plataforma
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Navbar Default */}
            <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[var(--color-info)]">Navegación / Header</span>
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Logo Estándar Navbar</h3>
                <p className="text-xs text-[var(--text-muted)]">Utilizado en la barra de navegación superior (Navbar).</p>
              </div>
              <div className="py-6 px-4 rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-[var(--border-soft)] flex items-center justify-center">
                <BrandLogo size={36} variant="full" />
              </div>
            </div>

            {/* Card 2: Dashboard Collapsed */}
            <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[var(--color-info)]">Sidebar Colapsado</span>
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Solo Icono</h3>
                <p className="text-xs text-[var(--text-muted)]">Utilizado en menú lateral colapsado y favicons.</p>
              </div>
              <div className="py-6 px-4 rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-[var(--border-soft)] flex items-center justify-center">
                <BrandLogo size={40} variant="icon" />
              </div>
            </div>

            {/* Card 3: App Icon Squircle */}
            <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[var(--color-info)]">iOS App / Splash</span>
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Icono de Aplicación</h3>
                <p className="text-xs text-[var(--text-muted)]">Con tarjeta squircle degradada de fondo (showBg).</p>
              </div>
              <div className="py-6 px-4 rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-[var(--border-soft)] flex items-center justify-center">
                <BrandLogo size={72} variant="icon" showBg={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Contrast Dark Test Section */}
        <section className="p-8 rounded-[var(--radius-2xl)] bg-[#09090b] text-[#fafafa] border border-[rgba(255,255,255,0.12)] shadow-[var(--shadow-lg)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.1)] pb-4">
            <div>
              <span className="text-xs font-semibold text-[var(--color-pending)] uppercase tracking-wider">
                Prueba de Alto Contraste
              </span>
              <h2 className="text-xl font-bold text-white">Visualización en Fondos Oscuros</h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">#09090b Surface-0 (Dark)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-8 rounded-[var(--radius-xl)] bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <BrandLogo size={120} variant="full" />
            </div>
            <div className="space-y-3 text-xs text-zinc-300">
              <p>
                El isotipo SVG utiliza gradientes fijos de plata y blanco con sombra de relieve para garantizar legibilidad perfecta sobre cualquier fondo oscuro sin perder los colores de marca.
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-zinc-400">
                <li>Base del calendario: <code className="text-white">#ECEEF3</code> a <code className="text-white">#E0E2E8</code></li>
                <li>Celda activa: Degradado primario (<code className="text-orange-400">#ff7300</code> → <code className="text-red-400">#e03000</code>)</li>
                <li>Clips metálicos: Gradiente cilíndrico de cromo</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
