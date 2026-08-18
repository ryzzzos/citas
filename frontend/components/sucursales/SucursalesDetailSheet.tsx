"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ExternalLink, MapPin, X } from "lucide-react";
import { motion } from "framer-motion";

import type { BusinessMapPoint } from "@/types";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SucursalesDetailSheetProps {
  business: BusinessMapPoint | null;
  businesses?: BusinessMapPoint[];
  onSelectBusiness?: (businessId: string) => void;
  onClose: () => void;
  hideOnMobile?: boolean;
}

function toInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() ?? "")
      .join("") || "BS"
  );
}

function SingleBusinessCard({
  item,
  isSelected,
  onSelect,
  onClose,
  isDraggingRef,
}: {
  item: BusinessMapPoint;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
  isDraggingRef?: React.MutableRefObject<boolean>;
}) {
  const [erroredLogoUrl, setErroredLogoUrl] = useState<string | null>(null);
  const [erroredCoverUrl, setErroredCoverUrl] = useState<string | null>(null);

  const canRenderLogo = Boolean(
    item.logo_image_url && item.logo_image_url !== erroredLogoUrl
  );
  const canRenderCover = Boolean(
    item.cover_image_url && item.cover_image_url !== erroredCoverUrl
  );

  return (
    <motion.article
      onClick={() => {
        if (isDraggingRef?.current) return;
        if (!isSelected) {
          onSelect();
        }
      }}
      animate={{
        scale: isSelected ? 1 : 0.93,
        opacity: isSelected ? 1 : 0.7,
        y: isSelected ? 0 : 3,
      }}
      whileTap={{ scale: isSelected ? 0.99 : 0.95 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
        mass: 0.7,
      }}
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius-xl)]",
        "bg-[var(--surface-glass)] backdrop-blur-2xl backdrop-saturate-150 shadow-[var(--shadow-lg)]",
        isSelected
          ? "border-2 border-[var(--border-strong)] shadow-2xl"
          : "border border-[var(--border-soft)] cursor-pointer hover:opacity-90",
        // Mobile layout: Compact peek card with responsive width
        "w-[82vw] max-w-[320px] h-[264px] shrink-0 snap-center select-none",
        // Desktop layout: Full original dimensions with height constrained below Navbar
        "lg:w-[400px] lg:h-[420px] lg:max-h-[calc(100dvh-env(safe-area-inset-top)-7.5rem)] lg:scale-100 lg:opacity-100 lg:border lg:border-[var(--border-soft)]",
        !isSelected && "lg:hidden"
      )}
      aria-label={`Detalle de sucursal: ${item.name}`}
    >
      {/* Cover Header */}
      <div className="relative h-24 sm:h-32 lg:h-48 w-full bg-[var(--surface-2)] shrink-0 overflow-hidden pointer-events-none">
        {canRenderCover ? (
          <Image
            src={item.cover_image_url as string}
            alt={`Portada de ${item.name}`}
            fill
            sizes="(max-width: 1024px) 320px, 400px"
            className={cn(
              "object-cover transition-transform duration-500 ease-out",
              isSelected ? "scale-105" : "scale-100"
            )}
            unoptimized
            onError={() => setErroredCoverUrl(item.cover_image_url)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-3)]" />
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Close Button (only active on selected card) */}
        {isSelected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "pointer-events-auto absolute right-2.5 top-2.5 z-20 inline-flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full",
              "bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/60 active:scale-95"
            )}
            aria-label="Cerrar detalle"
          >
            <X className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </button>
        )}

        {/* Category tag */}
        <div className="absolute bottom-2 left-3 lg:bottom-3 lg:left-4">
          <span className="inline-block rounded-full bg-black/45 border border-white/15 px-2 lg:px-2.5 py-0.5 text-[0.6rem] lg:text-[0.65rem] font-semibold tracking-wider text-white backdrop-blur-md uppercase">
            {item.category}
          </span>
        </div>
      </div>

      {/* Profile Picture Overlay between Cover and Surface on the right */}
      <div className="absolute right-4 top-24 sm:top-32 lg:top-48 -translate-y-1/2 z-10 pointer-events-none">
        <div
          className={cn(
            "relative grid h-13 w-13 lg:h-18 lg:w-18 place-items-center overflow-hidden rounded-xl",
            "bg-[var(--surface-3)] shadow-[var(--shadow-md)] border-2 border-[var(--surface-3)]",
            "transition-transform duration-300",
            isSelected ? "scale-100" : "scale-95"
          )}
        >
          {canRenderLogo ? (
            <Image
              src={item.logo_image_url as string}
              alt={`Logo de ${item.name}`}
              fill
              sizes="72px"
              className="object-cover"
              unoptimized
              onError={() => setErroredLogoUrl(item.logo_image_url)}
            />
          ) : (
            <span className="text-xs lg:text-base font-bold uppercase text-[var(--text-secondary)]">
              {toInitials(item.name)}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-3.5 lg:p-5 pt-3.5 lg:pt-7 justify-between min-w-0">
        <div className="min-w-0">
          <div className="pr-14 lg:pr-20">
            <h3
              className="text-base lg:text-xl font-bold tracking-tight text-[var(--text-primary)] truncate"
              title={item.name}
            >
              {item.name}
            </h3>

            <p className="mt-0.5 lg:mt-1.5 flex items-center gap-1 lg:gap-1.5 text-[0.75rem] lg:text-[0.85rem] font-medium text-[var(--text-secondary)]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-error)]" aria-hidden="true" />
              <span className="truncate">
                {item.address}, {item.city}
              </span>
            </p>
          </div>

          <p className="mt-1.5 lg:mt-4 text-[0.75rem] lg:text-[0.85rem] leading-relaxed text-[var(--text-muted)] line-clamp-1 lg:line-clamp-2">
            {item.public_bio?.trim() ||
              "Descubre su propuesta de valor, explora servicios destacados y conoce la experiencia completa en su perfil publico."}
          </p>
        </div>

        <Link
          href={`/${item.slug}?branch=${item.id}`}
          onClick={(e) => {
            if (isDraggingRef?.current) {
              e.preventDefault();
              return;
            }
            e.stopPropagation();
          }}
          className={cn(
            "mt-2 lg:mt-4 flex h-9 lg:h-11 w-full items-center justify-center gap-1.5 lg:gap-2 rounded-full shrink-0",
            "bg-[var(--app-primary)] text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99]"
          )}
        >
          <span className="text-[0.75rem] lg:text-[0.85rem] font-semibold">
            Ver perfil de la sucursal
          </span>
          <ExternalLink className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        </Link>
      </div>
    </motion.article>
  );
}

export default function SucursalesDetailSheet({
  business,
  businesses,
  onSelectBusiness,
  onClose,
  hideOnMobile,
}: SucursalesDetailSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Mouse drag-to-scroll state for desktop users with narrow viewport
  const isMouseDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const displayList = useMemo(() => {
    if (businesses && businesses.length > 0) {
      return businesses;
    }
    return business ? [business] : [];
  }, [businesses, business]);

  // Exact math centering helper
  const scrollToCard = useCallback((id: string, smooth: boolean = true) => {
    const container = containerRef.current;
    const card = cardRefs.current[id];
    if (!container || !card) return;

    const containerWidth = container.offsetWidth;
    const cardLeft = card.offsetLeft;
    const cardWidth = card.offsetWidth;

    // Exact mathematical pixel center
    const targetScrollLeft = cardLeft - (containerWidth - cardWidth) / 2;

    isProgrammaticScroll.current = true;
    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: smooth ? "smooth" : "auto",
    });

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 450);
  }, []);

  // Center selected business in carousel on mount or when business.id changes
  useEffect(() => {
    if (!business?.id) return;
    scrollToCard(business.id, true);
  }, [business?.id, scrollToCard]);

  // Handle manual touch/mouse scroll to update active business
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !onSelectBusiness || isProgrammaticScroll.current) return;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      if (!containerRef.current || isProgrammaticScroll.current) return;
      const container = containerRef.current;
      const containerCenter =
        container.getBoundingClientRect().left + container.offsetWidth / 2;

      let closestId: string | null = null;
      let closestDist = Infinity;

      displayList.forEach((item) => {
        const el = cardRefs.current[item.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const dist = Math.abs(containerCenter - cardCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closestId = item.id;
          }
        }
      });

      if (closestId && closestId !== business?.id && closestDist < 140) {
        onSelectBusiness(closestId);
      }
    }, 100);
  }, [displayList, business?.id, onSelectBusiness]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !containerRef.current) return;
    isMouseDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX;
    scrollLeftStart.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !containerRef.current) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 5) {
      isDragging.current = true;
    }
    if (isDragging.current) {
      e.preventDefault();
      containerRef.current.scrollLeft = scrollLeftStart.current - dx;
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    if (isDragging.current) {
      setTimeout(() => {
        isDragging.current = false;
      }, 50);
      handleScroll();
    }
  };

  if (!business) {
    return null;
  }

  return (
    <section
      aria-label="Carrusel de sucursales"
      className={cn(
        "pointer-events-auto fixed z-[460]",
        // Hide on mobile/tablet when the directory panel is open
        hideOnMobile && "max-lg:hidden",
        // Mobile / Narrow window: horizontal scrollable carousel with mouse-drag support
        "bottom-2.5 left-0 right-0 flex flex-row gap-3 overflow-x-auto snap-x snap-mandatory py-2 hide-scrollbar",
        "px-[calc((100vw-min(82vw,320px))/2)] cursor-grab active:cursor-grabbing",
        // Desktop full window: static floating container on right safely below Navbar
        "lg:bottom-6 lg:left-auto lg:right-6 lg:top-auto lg:w-[400px] lg:max-h-[calc(100dvh-env(safe-area-inset-top)-7.5rem)] lg:p-0 lg:overflow-visible lg:block lg:cursor-auto"
      )}
      ref={containerRef}
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      {displayList.map((item) => (
        <div
          key={item.id}
          ref={(el) => {
            cardRefs.current[item.id] = el;
          }}
          className="shrink-0 snap-center"
        >
          <SingleBusinessCard
            item={item}
            isSelected={item.id === business.id}
            isDraggingRef={isDragging}
            onSelect={() => {
              onSelectBusiness?.(item.id);
              scrollToCard(item.id, true);
            }}
            onClose={onClose}
          />
        </div>
      ))}
    </section>
  );
}


