import Image from "next/image";
import ServiceActionsMenu from "@/components/services/ServiceActionsMenu";
import type { Service } from "@/types";
import { useState } from "react";

interface ServicesListProps {
  services: Service[];
  disabled?: boolean;
  onEdit: (service: Service) => void;
  onToggleActive: (service: Service) => void;
  onDelete: (service: Service) => void;
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

function ServiceThumbnail({ service }: { service: Service }) {
  const [imageError, setImageError] = useState(false);

  if (!service.image_url || imageError) {
    return (
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-100/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-500"
        aria-label={service.image_url ? "No se pudo cargar la imagen del servicio" : "Servicio sin imagen"}
      >
        Sin
      </div>
    );
  }

  return (
    <Image
      src={service.image_url}
      alt={`Imagen del servicio ${service.name}`}
      width={56}
      height={56}
      className="h-14 w-14 shrink-0 rounded-xl border border-zinc-200/60 object-cover shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:border-zinc-800/60"
      loading="lazy"
      unoptimized
      onError={() => setImageError(true)}
    />
  );
}

export default function ServicesList({
  services,
  disabled,
  onEdit,
  onToggleActive,
  onDelete,
}: ServicesListProps) {
  return (
    <section className="min-h-[250px] rounded-3xl border border-white/50 bg-white/60 p-5 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Duración</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="align-top">
                <td className="rounded-l-2xl border-y border-l border-zinc-200/60 bg-zinc-50/50 px-4 py-3 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50">
                  <div className="flex items-start gap-4">
                    <ServiceThumbnail service={service} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white">{service.name}</p>
                      {service.description ? (
                        <p className="mt-1 line-clamp-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">{service.description}</p>
                      ) : (
                        <p className="mt-1 text-[12px] font-medium italic text-slate-400 dark:text-slate-500">Sin descripción</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="border-y border-zinc-200/60 bg-zinc-50/50 px-4 py-3 text-[13px] font-medium text-slate-600 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:text-slate-300">{service.duration_minutes} min</td>
                <td className="border-y border-zinc-200/60 bg-zinc-50/50 px-4 py-3 text-[13px] font-medium text-slate-600 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:text-slate-300">{formatPrice(service.price)}</td>
                <td className="border-y border-zinc-200/60 bg-zinc-50/50 px-4 py-3 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${
                      service.is_active
                        ? "border-blue-200/60 bg-blue-500/10 text-blue-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                        : "border-amber-200/60 bg-amber-500/10 text-amber-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                    }`}
                  >
                    {service.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="rounded-r-2xl border-y border-r border-zinc-200/60 bg-zinc-50/50 px-4 py-3 text-right backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50">
                  <ServiceActionsMenu
                    service={service}
                    disabled={disabled}
                    onEdit={onEdit}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
