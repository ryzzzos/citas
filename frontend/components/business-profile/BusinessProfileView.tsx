"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Scissors,
  Share2,
  Sparkles,
  Store,
} from "lucide-react";

import AppIcon from "@/components/ui/AppIcon";
import { BentoCard } from "@/components/ui/magic-card";
import { AccordionGroup, AccordionItem } from "@/components/ui/Accordion";
import type { Business, Service, ServiceCategory, Branch } from "@/types";

interface BusinessProfileViewProps {
  business: Business;
  services: Service[];
  categories?: ServiceCategory[];
  branch?: Branch;
  mode?: "dashboard-preview" | "public";
  isEditing?: boolean;
  onToggleEditing?: () => void;
  onServiceSelect?: (serviceId: string) => void;
}

interface MagicFeature {
  Icon: LucideIcon;
  name: string;
  durationBadge: string;
  priceBadge: string;
  description: string;
  href: string;
  cta: string;
  background: ReactNode;
}

function formatPrice(value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return `$${value}`;
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function InfoRow({
  label,
  value,
  href,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: string;
  href?: string | null;
  icon: LucideIcon;
  colorClass?: string;
}) {
  const opensExternal = Boolean(href && href.startsWith("http"));

  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3 dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
      <div className={`rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] p-2 dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)] ${colorClass || "text-[var(--text-secondary)]"}`}>
        <AppIcon icon={Icon} className="text-current" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] ">
          {label}
        </p>
        {href ? (
          <Link
            href={href}
            target={opensExternal ? "_blank" : undefined}
            rel={opensExternal ? "noreferrer" : undefined}
            className="dashboard-focusable mt-1 inline-flex break-all text-sm leading-6 text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--text-secondary)] dark:decoration-[var(--border-strong)] dark:hover:decoration-[var(--text-secondary)]"
          >
            {value}
          </Link>
        ) : (
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{value}</p>
        )}
      </div>
    </div>
  );
}

function Avatar({ logoUrl, businessName }: { logoUrl: string | null; businessName: string }) {
  const [logoError, setLogoError] = useState(false);

  if (!logoUrl || logoError) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-[1.65rem] border-4 border-[var(--border-strong)] bg-[var(--surface-1)] text-3xl font-semibold text-[var(--surface-3)] shadow-[var(--shadow-lg)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-0)] dark:text-[var(--text-primary)] sm:h-28 sm:w-28 md:h-32 md:w-32">
        {businessName.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={`Logo de ${businessName}`}
      width={128}
      height={128}
      className="h-24 w-24 rounded-[1.65rem] border-4 border-[var(--border-strong)] object-cover shadow-[var(--shadow-lg)] dark:border-[var(--border-strong)] sm:h-28 sm:w-28 md:h-32 md:w-32"
      unoptimized
      onError={() => setLogoError(true)}
    />
  );
}

export default function BusinessProfileView({
  business,
  services,
  categories = [],
  branch,
  mode = "dashboard-preview",
  isEditing = false,
  onToggleEditing,
  onServiceSelect,
}: BusinessProfileViewProps) {
  const [coverError, setCoverError] = useState(false);
  const hasActiveServices = useMemo(
    () => services.some((service) => service.is_active),
    [services]
  );
  const activeServices = useMemo(
    () => services.filter((service) => service.is_active),
    [services]
  );

  const displayPhone = branch?.phone || business.phone;
  const displayAddress = branch?.address || business.address;
  const displayCity = branch?.city || business.city;
  const displayWhatsapp = branch?.whatsapp_phone || business.whatsapp_phone;

  const phoneHref = useMemo(() => {
    const phone = (displayPhone ?? "").replace(/[^\d+]/g, "").trim();
    if (!phone) {
      return null;
    }
    return `tel:${phone}`;
  }, [displayPhone]);

  const whatsappHref = useMemo(() => {
    const phone = (displayWhatsapp ?? "").replace(/[^\d+]/g, "").trim();
    if (!phone) {
      return null;
    }
    return `https://wa.me/${phone.replace(/\+/g, "")}`;
  }, [displayWhatsapp]);

  const publicProfileHref = `/${business.slug}`;
  const bookingHref = `${publicProfileHref}#reserva`;
  const businessBio =
    business.public_bio?.trim() ||
    business.description?.trim() ||
    "Negocio verificado en Agenda Web. Gestion profesional y atencion personalizada.";

  const mapQuery = encodeURIComponent(`${displayAddress}, ${displayCity}`);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`;
  const demoIcons = useMemo(
    () => [Scissors, Sparkles, Clock3, BadgeDollarSign, Store],
    []
  );

  const groupedCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [{ id: "all", name: "Servicios", services: activeServices }];
    }

    const grouped = categories.map((cat) => ({
      ...cat,
      services: activeServices.filter((s) => s.service_category_id === cat.id),
    })).filter((cat) => cat.services.length > 0);

    const uncategorized = activeServices.filter(
      (s) => !s.service_category_id || !categories.some((c) => c.id === s.service_category_id)
    );

    if (uncategorized.length > 0) {
      grouped.push({
        id: "uncategorized",
        name: "Otros servicios",
        services: uncategorized,
        position: 9999,
        description: null,
        business_id: "",
      });
    }

    return grouped;
  }, [activeServices, categories]);

  return (
    <section className="space-y-5">
      <article className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-2)]  shadow-[var(--shadow-md)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)]">
        <div className="relative isolate">
          {!business.cover_image_url || coverError ? (
            <div className="aspect-[20/8] w-full lg:aspect-[24/8]" />
          ) : (
            <Image
              src={business.cover_image_url}
              alt={`Portada de ${business.name}`}
              width={1920}
              height={640}
              className="aspect-[20/8] w-full object-cover lg:aspect-[24/8]"
              unoptimized
              onError={() => setCoverError(true)}
            />
          )}

          <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--surface-glass)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-success)] backdrop-blur-md backdrop-saturate-150">
              <Store className="h-3.5 w-3.5" aria-hidden="true" />
              Perfil verificado
            </span>
          </div>
        </div>

        <div className="relative px-4 pb-5 sm:px-6 sm:pb-6 lg:px-8">
          <div className="-mt-14 rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-md)] backdrop-blur-md backdrop-saturate-150 dark:border-[var(--border-strong)] dark:bg-[var(--surface-glass)] sm:-mt-16 sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Avatar logoUrl={business.logo_image_url} businessName={business.name} />
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
                      {business.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] ">
                      <MapPin className="h-3.5 w-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
                      {displayCity}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-[2.15rem]">
                    {business.name}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                    {businessBio}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 pt-4 sm:w-[240px] lg:pt-0">
                {mode === "dashboard-preview" && onToggleEditing ? (
                  <button
                    type="button"
                    onClick={onToggleEditing}
                    className="dashboard-focusable inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-6 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:hover:bg-[var(--surface-2)]"
                  >
                    <AppIcon icon={Pencil} />
                    {isEditing ? "Cerrar editor" : "Editar perfil"}
                  </button>
                ) : null}

                {mode === "dashboard-preview" ? (
                  <Link
                    href={publicProfileHref}
                    className="dashboard-focusable inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full border-transparent bg-[var(--app-primary)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition-colors hover:brightness-110"
                  >
                    Ver perfil publico
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <div className="flex w-full flex-col gap-3">
                    {hasActiveServices && (
                      <Link
                        href={bookingHref}
                        className="dashboard-focusable inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full border-transparent bg-[var(--app-primary)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition-colors hover:brightness-110"
                      >
                        Reservar ahora
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                    <button
                      type="button"
                      className="dashboard-focusable inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-6 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:hover:bg-[var(--surface-2)]"
                    >
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                      Compartir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 sm:px-6 sm:pb-7 lg:px-8 lg:pb-8">
          <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className="h-fit rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-md)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] sm:p-5">
                <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                  Informacion del negocio
                </h2>

                <div className="mt-4 space-y-3">
                  <InfoRow label="Ubicacion" value={`${displayAddress}, ${displayCity}`} icon={MapPin} colorClass="text-[var(--color-error)]" />
                  <InfoRow label="Telefono" value={displayPhone} href={phoneHref} icon={Phone} colorClass="text-[var(--color-info)]" />
                  <InfoRow
                    label="WhatsApp"
                    value={displayWhatsapp ?? "No configurado"}
                    href={whatsappHref}
                    icon={MessageCircle}
                    colorClass="text-[var(--color-success)]"
                  />
                  <InfoRow label="Correo" value={business.email} href={`mailto:${business.email}`} icon={Mail} colorClass="text-[var(--color-pending)]" />
                </div>


              </section>

              <section className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-md)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
                <iframe
                  title={`Mapa de ${business.name}`}
                  src={mapEmbedUrl}
                  className="block h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </section>
            </aside>

            <div className="space-y-5">
              {groupedCategories.length > 0 ? (
                <AccordionGroup>
                  {groupedCategories.map((group, groupIndex) => {
                    const magicFeaturesForGroup = group.services.map((service, index) => {
                      const serviceDescription =
                        service.description?.trim() ??
                        "Servicio premium con enfoque en detalle, comodidad y resultados consistentes.";

                      return {
                        Icon: demoIcons[index % demoIcons.length],
                        name: service.name,
                        durationBadge: `${service.duration_minutes} min`,
                        priceBadge: formatPrice(service.price),
                        description: serviceDescription,
                        href: `/${business.slug}?service=${service.id}#reserva`,
                        cta: "Reservar servicio",
                        onCtaClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                          if (onServiceSelect) {
                            e.preventDefault();
                            onServiceSelect(service.id);
                          }
                        },
                        background: service.image_url ? (
                          <Image
                            src={service.image_url}
                            alt=""
                            width={272}
                            height={272}
                            className="h-full w-full max-w-[17rem] rounded-3xl object-cover object-top"
                            loading="lazy"
                            unoptimized
                          />
                        ) : (
                          <div className="h-full w-full max-w-[17rem] rounded-3xl bg-[var(--surface-glass)]" />
                        ),
                      };
                    });

                    return (
                      <AccordionItem 
                        key={group.id} 
                        title={group.name} 
                        defaultOpen={groupIndex === 0}
                      >
                        <div className="relative w-full">
                          <div className="flex flex-row gap-5 overflow-x-auto py-8 px-4 snap-x snap-mandatory after:content-[''] after:w-4 after:shrink-0">
                            {magicFeaturesForGroup.map((feature) => (
                              <BentoCard 
                                key={feature.name} 
                                {...feature} 
                                className="w-[270px] min-w-[270px] shrink-0 snap-center"
                              />
                            ))}
                          </div>
                          
                          {/* Gradientes laterales para simular desvanecimiento */}
                          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-4 bg-gradient-to-r from-[var(--surface-3)] to-transparent" />
                          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-4 bg-gradient-to-l from-[var(--surface-3)] to-transparent" />
                        </div>
                      </AccordionItem>
                    );
                  })}
                </AccordionGroup>
              ) : (
                <section className="rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-md)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] sm:p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                      Servicios
                    </h2>
                  </div>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    No hay servicios activos para mostrar.
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
