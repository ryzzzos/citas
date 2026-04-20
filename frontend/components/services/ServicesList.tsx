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
        className="dashboard-surface-2 dashboard-text-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-[11px]"
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
      className="h-14 w-14 shrink-0 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
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
    <section className="dashboard-surface-1 min-h-[250px] p-4 sm:p-5">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-separate border-spacing-y-2">
          <thead>
            <tr className="dashboard-text-muted text-left text-xs uppercase tracking-[0.14em]">
              <th className="px-3 py-1">Nombre</th>
              <th className="px-3 py-1">Duracion</th>
              <th className="px-3 py-1">Precio</th>
              <th className="px-3 py-1">Estado</th>
              <th className="px-3 py-1 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="dashboard-surface-2 align-top">
                <td className="px-3 py-3">
                  <div className="flex items-start gap-3">
                    <ServiceThumbnail service={service} />
                    <div className="min-w-0">
                      <p className="dashboard-title text-sm font-semibold">{service.name}</p>
                      {service.description ? (
                        <p className="dashboard-text-muted mt-1 line-clamp-2 text-xs">{service.description}</p>
                      ) : (
                        <p className="dashboard-text-muted mt-1 text-xs">Sin descripcion</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="dashboard-text-secondary px-3 py-3 text-sm">{service.duration_minutes} min</td>
                <td className="dashboard-text-secondary px-3 py-3 text-sm">{formatPrice(service.price)}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      service.is_active
                        ? "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-600/60 dark:bg-teal-500/15 dark:text-teal-200"
                        : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/60 dark:bg-amber-500/15 dark:text-amber-200"
                    }`}
                  >
                    {service.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
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
