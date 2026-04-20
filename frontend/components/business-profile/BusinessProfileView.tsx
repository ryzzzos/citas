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
    <div className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="rounded-full border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800">
        <AppIcon icon={Icon} className="text-zinc-600 dark:text-zinc-300" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        {href ? (
          <Link
            href={href}
            target={opensExternal ? "_blank" : undefined}
            rel={opensExternal ? "noreferrer" : undefined}
            className="dashboard-focusable mt-1 inline-flex break-all text-sm leading-6 text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-300"
          >
            {value}
          </Link>
        ) : (
          <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{value}</p>
        )}
      </div>
    </div>
  );
}

function Avatar({ logoUrl, businessName }: { logoUrl: string | null; businessName: string }) {
  const [logoError, setLogoError] = useState(false);

  if (!logoUrl || logoError) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-[1.65rem] border-4 border-white bg-zinc-800 text-3xl font-semibold text-white shadow-[0_20px_40px_-28px_rgba(15,23,42,0.75)] dark:border-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 sm:h-28 sm:w-28 md:h-32 md:w-32">
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
      className="h-24 w-24 rounded-[1.65rem] border-4 border-white object-cover shadow-[0_20px_40px_-28px_rgba(15,23,42,0.75)] dark:border-zinc-900 sm:h-28 sm:w-28 md:h-32 md:w-32"
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
          <div className="h-full w-full max-w-[17rem] rounded-3xl bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.18),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),transparent_38%)]" />
        ),
      };
    });
  }, [activeServices, business.slug, demoIcons]);

  return (
    <section className="space-y-5">
      <article className="overflow-hidden rounded-[2rem] border border-zinc-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_40px_80px_-60px_rgba(15,23,42,0.58)] dark:border-zinc-800 dark:bg-[linear-gradient(180deg,#0b1220_0%,#060b14_100%)]">
        <div className="relative isolate">
          {!business.cover_image_url || coverError ? (
            <div className="aspect-[20/8] w-full bg-[linear-gradient(140deg,#314f78_0%,#286c80_42%,#3f6da7_100%)] lg:aspect-[24/8]" />
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

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.28),transparent_45%)]" />
          <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
              <Store className="h-3.5 w-3.5" aria-hidden="true" />
              Perfil verificado
            </span>
          </div>
        </div>

        <div className="relative px-4 pb-5 sm:px-6 sm:pb-6 lg:px-8">
          <div className="-mt-14 rounded-[1.75rem] border border-zinc-200/85 bg-white/95 p-4 shadow-[0_28px_55px_-44px_rgba(15,23,42,0.6)] backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/94 sm:-mt-16 sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Avatar logoUrl={business.logo_image_url} businessName={business.name} />
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {business.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {business.city}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-[2.15rem]">
                    {business.name}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {businessBio}
                  </p>
                </div>
              </div>

              <div className="grid w-full gap-2 sm:w-auto sm:min-w-[240px]">
                {mode === "dashboard-preview" && onToggleEditing ? (
                  <button
                    type="button"
                    onClick={onToggleEditing}
                    className="dashboard-focusable dashboard-interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-zinc-100 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <AppIcon icon={Pencil} />
                    {isEditing ? "Cerrar editor" : "Editar perfil"}
                  </button>
                ) : null}

                {mode === "dashboard-preview" ? (
                  <Link
                    href={publicProfileHref}
                    className="dashboard-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Ver perfil publico
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : hasActiveServices ? (
                  <Link
                    href={bookingHref}
                    className="dashboard-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Reservar ahora
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}

                {whatsappHref ? (
                  <Link
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="dashboard-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <AppIcon icon={MessageCircle} />
                    WhatsApp
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 sm:px-6 sm:pb-7 lg:px-8 lg:pb-8">
          <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className="h-fit rounded-[1.6rem] border border-zinc-200 bg-white p-4 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.52)] dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
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
                      className="dashboard-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <AppIcon icon={MessageCircle} />
                      Contactar por WhatsApp
                    </Link>
                  ) : null}

                  {phoneHref ? (
                    <Link
                      href={phoneHref}
                      className="dashboard-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-zinc-100 px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <AppIcon icon={Phone} />
                      Llamar ahora
                    </Link>
                  ) : null}
                </div>
              </section>

              <section className="overflow-hidden rounded-[1.6rem] border border-zinc-200 bg-white shadow-[0_20px_45px_-38px_rgba(15,23,42,0.52)] dark:border-zinc-800 dark:bg-zinc-900">
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
              <section className="rounded-[1.8rem] border border-zinc-200/90 bg-white/95 p-4 shadow-[0_28px_56px_-42px_rgba(15,23,42,0.55)] dark:border-zinc-800 dark:bg-zinc-900/95 sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Servicios
                  </h2>
                  <span className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
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
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
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
