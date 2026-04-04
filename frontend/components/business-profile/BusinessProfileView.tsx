"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Mail, MapPin, MessageCircle, Pencil, Phone, Tag } from "lucide-react";

import AppIcon from "@/components/ui/AppIcon";
import type { Business, Service } from "@/types";

import BusinessServicesShowcase from "./BusinessServicesShowcase";

interface BusinessProfileViewProps {
  business: Business;
  services: Service[];
  mode?: "dashboard-preview" | "public";
  isEditing?: boolean;
  onToggleEditing?: () => void;
}

function InfoRow({ value, icon: Icon }: { value: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start gap-2.5">
      <AppIcon icon={Icon} className="mt-1 text-slate-500 dark:text-slate-400" />
      <div>
        <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function Avatar({ logoUrl, businessName }: { logoUrl: string | null; businessName: string }) {
  const [logoError, setLogoError] = useState(false);

  if (!logoUrl || logoError) {
    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-slate-700 text-4xl font-semibold text-white shadow-2xl shadow-slate-900/30 dark:border-slate-900 dark:bg-slate-300 dark:text-slate-900 md:h-36 md:w-36">
        {businessName.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`Logo de ${businessName}`}
      className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-2xl shadow-slate-900/30 dark:border-slate-900 md:h-36 md:w-36"
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

  const mapQuery = encodeURIComponent(`${business.address}, ${business.city}`);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`;

  return (
    <section className="space-y-4">
      <article className="overflow-hidden rounded-none border border-slate-200 bg-slate-50 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.45)] lg:rounded-b-2xl lg:rounded-t-none dark:border-slate-800 dark:bg-slate-950">
        <div className="relative">
          {!business.cover_image_url || coverError ? (
            <div className="aspect-[22/9] w-full bg-[linear-gradient(180deg,#2f4f78_0%,#355a88_38%,#3f6798_100%)] lg:aspect-[24/9]" />
          ) : (
            <img
              src={business.cover_image_url}
              alt={`Portada de ${business.name}`}
              className="aspect-[22/9] w-full object-cover lg:aspect-[24/9]"
              onError={() => setCoverError(true)}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/28 to-transparent" />
        </div>

        <div className="border-b border-slate-200 bg-white px-4 pb-4 dark:border-slate-800 dark:bg-slate-900 md:px-6">
          <div className="flex flex-col gap-4 pt-5 md:flex-row md:items-end md:justify-between md:pt-6">
            <div className="flex items-start gap-4 md:gap-5">
              <Avatar logoUrl={business.logo_image_url} businessName={business.name} />
              <div className="min-w-0 pb-1">
                <h1 className="text-[1.8rem] font-bold tracking-tight text-slate-900 dark:text-white md:text-[2rem]">{business.name}</h1>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{business.city} · {business.address}</p>
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {business.public_bio ?? "Negocio verificado en Agenda Web."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {mode === "dashboard-preview" && onToggleEditing ? (
                <button
                  type="button"
                  onClick={onToggleEditing}
                  className="dashboard-focusable dashboard-interactive inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  <AppIcon icon={Pencil} />
                  {isEditing ? "Cerrar panel" : "Editar"}
                </button>
              ) : null}

              {whatsappHref ? (
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="dashboard-focusable dashboard-interactive inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  <AppIcon icon={MessageCircle} className="mr-2" />
                  Contactar
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-4 pb-6 pt-4 md:px-6 md:pt-6 dark:bg-slate-950">
          <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
            <aside className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="p-4">
                <div className="space-y-4">
                  <InfoRow value={`${business.address}, ${business.city}`} icon={MapPin} />
                  <InfoRow value={business.phone} icon={Phone} />
                  <InfoRow value={business.whatsapp_phone ?? "No configurado"} icon={MessageCircle} />
                  <InfoRow value={business.email} icon={Mail} />
                  <InfoRow value={business.category} icon={Tag} />
                </div>

                <div className="mt-5 grid gap-2">
                  {whatsappHref ? (
                    <Link
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="dashboard-focusable dashboard-interactive inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                      <AppIcon icon={MessageCircle} className="mr-2" />
                      Contactar por WhatsApp
                    </Link>
                  ) : null}

                  {phoneHref ? (
                    <Link
                      href={phoneHref}
                      className="dashboard-focusable dashboard-interactive inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                      <AppIcon icon={Phone} className="mr-2" />
                      Llamar ahora
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800">
                <iframe
                  title={`Mapa de ${business.name}`}
                  src={mapEmbedUrl}
                  className="block h-56 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </aside>

            <div className="space-y-4">
              <BusinessServicesShowcase services={services} />
            </div>
          </div>
        </div>
      </article>

    </section>
  );
}
