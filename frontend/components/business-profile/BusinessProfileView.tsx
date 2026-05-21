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
  Sparkles,
  Store,
} from "lucide-react";

import AppIcon from "@/components/ui/AppIcon";
import { BentoCard, BentoGrid } from "@/components/ui/magic-card";
import type { Business, Service } from "@/types";

interface BusinessProfileViewProps {
  business: Business;
  services: Service[];
  mode?: "dashboard-preview" | "public";
  isEditing?: boolean;
  onToggleEditing?: () => void;
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
}: {
  label: string;
  value: string;
  href?: string | null;
  icon: LucideIcon;
}) {
  const opensExternal = Boolean(href && href.startsWith("http"));

  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3 dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
      <div className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] p-2 dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)]">
        <AppIcon icon={Icon} className="text-[var(--text-secondary)]" />
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
  mode = "dashboard-preview",
  isEditing = false,
  onToggleEditing,
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

  const phoneHref = useMemo(() => {
    const phone = (business.phone ?? "").replace(/[^\d+]/g, "").trim();
    if (!phone) {
      return null;
    }
    return `tel:${phone}`;
  }, [business.phone]);

  const whatsappHref = useMemo(() => {
    const phone = (business.whatsapp_phone ?? "").replace(/[^\d+]/g, "").trim();
    if (!phone) {
      return null;
    }
    return `https://wa.me/${phone.replace(/\+/g, "")}`;
  }, [business.whatsapp_phone]);

  const publicProfileHref = `/${business.slug}`;
  const bookingHref = `${publicProfileHref}#reserva`;
  const businessBio =
    business.public_bio?.trim() ||
    business.description?.trim() ||
    "Negocio verificado en Agenda Web. Gestion profesional y atencion personalizada.";

  const mapQuery = encodeURIComponent(`${business.address}, ${business.city}`);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`;
  const demoIcons = useMemo(
    () => [Scissors, Sparkles, Clock3, BadgeDollarSign, Store],
    []
  );
  const magicFeatures = useMemo<MagicFeature[]>(() => {
    return activeServices.slice(0, 5).map((service, index) => {
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
  }, [activeServices, business.slug, demoIcons]);

  return (
    <section className="space-y-5">
      <article className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)]  shadow-[var(--shadow-md)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)]">
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--surface-glass)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] backdrop-blur-md">
              <Store className="h-3.5 w-3.5" aria-hidden="true" />
              Perfil verificado
            </span>
          </div>
        </div>

        <div className="relative px-4 pb-5 sm:px-6 sm:pb-6 lg:px-8">
          <div className="-mt-14 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-md)] backdrop-blur-md dark:border-[var(--border-strong)] dark:bg-[var(--surface-glass)] sm:-mt-16 sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Avatar logoUrl={business.logo_image_url} businessName={business.name} />
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
                      {business.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] ">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {business.city}
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

              <div className="grid w-full gap-2 sm:w-auto sm:min-w-[240px]">
                {mode === "dashboard-preview" && onToggleEditing ? (
                  <button
                    type="button"
                    onClick={onToggleEditing}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-4 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:hover:bg-[var(--surface-2)]"
                  >
                    <AppIcon icon={Pencil} />
                    {isEditing ? "Cerrar editor" : "Editar perfil"}
                  </button>
                ) : null}

                {mode === "dashboard-preview" ? (
                  <Link
                    href={publicProfileHref}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--surface-2)]"
                  >
                    Ver perfil publico
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : hasActiveServices ? (
                  <Link
                    href={bookingHref}
                    className="dashboard-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--surface-2)]"
                  >
                    Reservar ahora
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}

              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 sm:px-6 sm:pb-7 lg:px-8 lg:pb-8">
          <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className="h-fit rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-md)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] sm:p-5">
                <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                  Informacion del negocio
                </h2>

                <div className="mt-4 space-y-3">
                  <InfoRow label="Ubicacion" value={`${business.address}, ${business.city}`} icon={MapPin} />
                  <InfoRow label="Telefono" value={business.phone} href={phoneHref} icon={Phone} />
                  <InfoRow
                    label="WhatsApp"
                    value={business.whatsapp_phone ?? "No configurado"}
                    href={whatsappHref}
                    icon={MessageCircle}
                  />
                  <InfoRow label="Correo" value={business.email} href={`mailto:${business.email}`} icon={Mail} />
                </div>

                <div className="mt-5 grid gap-2">
                  {whatsappHref ? (
                    <Link
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--surface-2)]"
                    >
                      <AppIcon icon={MessageCircle} />
                      Contactar por WhatsApp
                    </Link>
                  ) : null}

                  {phoneHref ? (
                    <Link
                      href={phoneHref}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:hover:bg-[var(--surface-2)]"
                    >
                      <AppIcon icon={Phone} />
                      Llamar ahora
                    </Link>
                  ) : null}
                </div>
              </section>

              <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-md)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
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
              <section className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-md)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                    Servicios
                  </h2>
                  <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
                    Magic Card
                  </span>
                </div>

                {magicFeatures.length > 0 ? (
                  <BentoGrid>
                    {magicFeatures.map((feature) => (
                      <BentoCard key={feature.name} {...feature} />
                    ))}
                  </BentoGrid>
                ) : (
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    No hay servicios activos para mostrar.
                  </p>
                )}
              </section>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
