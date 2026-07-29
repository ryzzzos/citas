import type { SVGProps } from "react";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface BrandLogoProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  /** Size of the logo icon in pixels */
  size?: number;
  /** Layout variant: 'full' (icon + text) or 'icon' (only icon) */
  variant?: "full" | "icon";
  /** Whether to show the background card container (for app icon style) */
  showBg?: boolean;
  /** Optional extra classes for the outer container */
  containerClassName?: string;
}

export default function BrandLogo({
  size = 36,
  variant = "full",
  showBg = false,
  containerClassName,
  className,
  ...props
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 select-none", containerClassName)}>
      {/* 
        Icono SVG Premium: Con alto contraste en modo oscuro (fondos blancos/plata fijos 
        para que destaque sobre el fondo oscuro de la app).
      */}
      <svg
        width={size}
        height={size * 1.1} // Mantiene la relación de aspecto del viewBox recortado (372 x 412)
        viewBox="70 50 372 412"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 transition-transform duration-300 hover:scale-[1.04]", className)}
        {...props}
      >
        <defs>
          {/* Sombras complejas y ambientales */}
          <filter id="softDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="24" floodColor="#000000" floodOpacity="0.08" />
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.04" />
          </filter>

          <filter id="accentShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="6" dy="14" stdDeviation="14" floodColor="#e03000" floodOpacity="0.35" />
          </filter>

          <filter id="ringShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.3" />
          </filter>

          <filter id="innerGridShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000000" floodOpacity="0.10" />
          </filter>

          {/* Degradados de superficie — base neutra cálida premium */}
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F3F0" />
            <stop offset="100%" stopColor="#E8E6E2" />
          </linearGradient>

          <linearGradient id="calendarSurface" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ECEEF3" />
            <stop offset="100%" stopColor="#E0E2E8" />
          </linearGradient>

          <linearGradient id="gridSurface" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8F8FB" />
          </linearGradient>

          {/* Degradado Activo de la Marca (Naranja → Rojo, colores primarios de la app) */}
          <linearGradient id="activeBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffaa44" />
            <stop offset="50%" stopColor="#ff7300" />
            <stop offset="100%" stopColor="#e03000" />
          </linearGradient>

          {/* Degradado cilíndrico perfecto para anillos metálicos */}
          <linearGradient id="chromeCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B0B0B8" />
            <stop offset="20%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#8E8E93" />
            <stop offset="85%" stopColor="#E5E5EA" />
            <stop offset="100%" stopColor="#48484A" />
          </linearGradient>

          {/* Degradado para la base del agujero en el papel */}
          <linearGradient id="ringBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1C1C1E" />
            <stop offset="100%" stopColor="#3A3A3C" />
          </linearGradient>
        </defs>

        {/* Fondo opcional (para modo icono de aplicación independiente) */}
        {showBg && <rect x="70" y="50" width="372" height="412" rx="84" fill="url(#bgGrad)" />}

        {/* Calendario Base */}
        <rect x="76" y="96" width="360" height="360" rx="52" fill="url(#calendarSurface)" />
        <rect x="76" y="96" width="360" height="360" rx="52" fill="none" stroke="#CBCDD4" strokeWidth="2.5" />

        {/* Cuadros Internos Estáticos */}
        <rect x="116" y="136" width="132" height="132" rx="32" fill="url(#gridSurface)" filter="url(#innerGridShadow)" />
        <rect x="116" y="136" width="132" height="132" rx="32" fill="none" stroke="#D0D2D9" strokeWidth="1.5" />

        <rect x="264" y="136" width="132" height="132" rx="32" fill="url(#gridSurface)" filter="url(#innerGridShadow)" />
        <rect x="264" y="136" width="132" height="132" rx="32" fill="none" stroke="#D0D2D9" strokeWidth="1.5" />

        <rect x="116" y="284" width="132" height="132" rx="32" fill="url(#gridSurface)" filter="url(#innerGridShadow)" />
        <rect x="116" y="284" width="132" height="132" rx="32" fill="none" stroke="#D0D2D9" strokeWidth="1.5" />

        {/* Cuadro Activo de Marca (Degradado Primario Naranja→Rojo) */}
        <rect
          x="280"
          y="300"
          width="132"
          height="132"
          rx="32"
          fill="url(#activeBrandGrad)"
          filter="url(#accentShadow)"
        />
        <rect x="280" y="300" width="132" height="132" rx="32" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="2" />

        {/* Icono WEB (Globo terráqueo minimalista) */}
        <circle cx="346" cy="366" r="32" fill="none" stroke="#FFFFFF" strokeWidth="8" />
        <ellipse cx="346" cy="366" rx="14" ry="32" fill="none" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M 314 366 L 378 366" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />

        {/* CLIPS METÁLICOS MEJORADOS (Efecto Cilíndrico y Orificios de Papel) */}

        {/* Orificio Izquierdo */}
        <ellipse cx="166" cy="124" rx="18" ry="12" fill="#D8DAE0" />
        <ellipse cx="166" cy="126" rx="15" ry="9" fill="url(#ringBase)" />

        {/* Orificio Derecho */}
        <ellipse cx="346" cy="124" rx="18" ry="12" fill="#D8DAE0" />
        <ellipse cx="346" cy="126" rx="15" ry="9" fill="url(#ringBase)" />

        {/* Clip Cilíndrico Izquierdo */}
        <rect x="154" y="60" width="24" height="68" rx="12" fill="url(#chromeCylinder)" />
        <rect x="158" y="63" width="5" height="62" rx="2.5" fill="#FFFFFF" opacity="0.9" />
        <rect x="173" y="64" width="2" height="60" rx="1" fill="#FFFFFF" opacity="0.5" />

        {/* Clip Cilíndrico Derecho */}
        <rect x="334" y="60" width="24" height="68" rx="12" fill="url(#chromeCylinder)" />
        <rect x="338" y="63" width="5" height="62" rx="2.5" fill="#FFFFFF" opacity="0.9" />
        <rect x="353" y="64" width="2" height="60" rx="1" fill="#FFFFFF" opacity="0.5" />
      </svg>

      {/* Tipografía del Nombre */}
      {variant === "full" && (
        <div className="flex items-baseline leading-none font-sans text-[1.22rem] tracking-tight">
          <span className="font-bold text-[var(--text-primary)]">
            Agenda
          </span>
          <span className="font-light text-[var(--text-secondary)]">
            Web
          </span>
        </div>
      )}
    </div>
  );
}
