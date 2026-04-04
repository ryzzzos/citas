"use client";

import { useState } from "react";

import type { Service } from "@/types";

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

function ServiceThumbnail({ service }: { service: Service }) {
  const [imageError, setImageError] = useState(false);

  if (!service.image_url || imageError) {
    return (
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300/80 bg-zinc-100/70 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400"
        aria-label={service.image_url ? "No se pudo cargar la imagen del servicio" : "Servicio sin imagen"}
      >
        Sin
      </div>
    );
  }

  return (
    <img
      src={service.image_url}
      alt={`Imagen del servicio ${service.name}`}
      className="h-16 w-16 shrink-0 rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
      loading="lazy"
      onError={() => setImageError(true)}
    />
  );
}

export default function BusinessServicesShowcase({ services }: { services: Service[] }) {
  const activeServices = services.filter((service) => service.is_active);

  if (activeServices.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Servicios publicados</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Aun no hay servicios publicados. Puedes agregarlos desde el modulo Mis servicios.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Servicios publicados</h2>
        <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {activeServices.length} activos
        </span>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {activeServices.map((service) => (
            <li key={service.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <article className="flex items-start gap-3">
                <ServiceThumbnail service={service} />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{service.name}</h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {service.duration_minutes} min · {formatPrice(service.price)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {service.description ?? "Servicio sin descripcion publica."}
                  </p>
                </div>
              </article>
            </li>
          ))}
      </ul>
    </section>
  );
}
