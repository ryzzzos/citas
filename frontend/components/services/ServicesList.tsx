import Image from "next/image";
import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import ServiceActionsMenu from "@/components/services/ServiceActionsMenu";
import type { Service } from "@/types";

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
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-0)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] dark:bg-[var(--surface-0)] dark:text-[var(--text-muted)]"
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
      className="h-14 w-14 shrink-0 rounded-xl border border-[var(--border-strong)] object-cover shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:border-[var(--border-strong)]"
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <section className="min-h-[250px] rounded-[2rem] border border-[var(--border-strong)] bg-[var(--surface-2)] p-5 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.52)] backdrop-blur-2xl dark:border-[var(--border-strong)] dark:bg-[#0b1220]/60 dark:shadow-[0_40px_80px_-60px_rgba(15,23,42,0.58)] sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Tus Servicios</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Gestiona el catálogo de servicios ofrecidos</p>
        </div>

        <div className="inline-flex min-h-11 items-center gap-1 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-1.5 shadow-[var(--shadow-[var(--shadow-sm)])] backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)]">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold transition-all ${
              viewMode === "grid"
                ? "bg-[var(--app-primary-gradient)] text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.4),inset_0_1px_rgba(255,255,255,0.25)] border border-t-[rgba(255,255,255,0.1)] border-b-[rgba(0,0,0,0.2)] border-x-transparent"
                : "text-[var(--text-secondary)] hover:bg-white hover:shadow-[var(--shadow-sm)]  dark:hover:bg-[var(--surface-2)] dark:hover:text-zinc-200"
            }`}
            aria-label="Vista de cuadrícula"
          >
            <AppIcon icon={LayoutGrid} size="sm" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold transition-all ${
              viewMode === "list"
                ? "bg-[var(--app-primary-gradient)] text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.4),inset_0_1px_rgba(255,255,255,0.25)] border border-t-[rgba(255,255,255,0.1)] border-b-[rgba(0,0,0,0.2)] border-x-transparent"
                : "text-[var(--text-secondary)] hover:bg-white hover:shadow-[var(--shadow-sm)]  dark:hover:bg-[var(--surface-2)] dark:hover:text-zinc-200"
            }`}
            aria-label="Vista de lista"
          >
            <AppIcon icon={List} size="sm" />
            Lista
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] hide-scrollbar">
        <table className="min-w-full table-fixed border-separate border-spacing-y-3">
          <thead className="sticky top-0 z-10 bg-[var(--surface-3)]/ backdrop-blur-md dark:bg-[#0b1220]/80">
            <tr className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <th className="px-5 py-3">Nombre del servicio</th>
              <th className="px-5 py-3 w-32">Duración</th>
              <th className="px-5 py-3 w-32">Precio</th>
              <th className="px-5 py-3 w-28">Estado</th>
              <th className="px-5 py-3 w-20 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="group transition-all hover:scale-[1.01] hover:shadow-[var(--shadow-sm)]">
                <td className="rounded-l-2xl border-y border-l border-[var(--border-strong)] bg-zinc-50/80 px-5 py-4 align-middle backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]/60">
                  <div className="flex items-center gap-4">
                    <ServiceThumbnail service={service} />
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">{service.name}</p>
                      {service.description ? (
                        <p className="mt-1 line-clamp-1 text-[13px] font-medium text-[var(--text-secondary)]">{service.description}</p>
                      ) : (
                        <p className="mt-1 text-[13px] font-medium italic text-[var(--text-muted)] dark:text-[var(--text-secondary)]">Sin descripción</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="border-y border-[var(--border-strong)] bg-zinc-50/80 px-5 py-4 align-middle text-[14px] font-semibold text-[var(--text-secondary)] backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]/60">{service.duration_minutes} min</td>
                <td className="border-y border-[var(--border-strong)] bg-zinc-50/80 px-5 py-4 align-middle text-[14px] font-semibold text-[var(--text-secondary)] backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]/60">{formatPrice(service.price)}</td>
                <td className="border-y border-[var(--border-strong)] bg-zinc-50/80 px-5 py-4 align-middle backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]/60">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${
                      service.is_active
                        ? "border-blue-200/80 bg-blue-500/10 text-blue-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                        : "border-amber-200/80 bg-amber-500/10 text-amber-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                    }`}
                  >
                    {service.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="rounded-r-2xl border-y border-r border-[var(--border-strong)] bg-zinc-50/80 px-5 py-4 align-middle text-right backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]/60">
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
      ) : (
        <div className="grid max-h-[calc(100vh-320px)] grid-cols-1 gap-6 overflow-y-auto hide-scrollbar pb-6 pr-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.id}
              className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[1.75rem] border border-[var(--border-strong)] p-5 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_28px_55px_-44px_rgba(15,23,42,0.5)] dark:border-[var(--border-strong)]"
            >
              {service.image_url ? (
                <>
                  <Image
                    src={service.image_url}
                    alt={`Background for ${service.name}`}
                    fill
                    unoptimized
                    className="absolute inset-0 z-0 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 transition-opacity duration-300 group-hover:opacity-90" />
                </>
              ) : (
                <div className="absolute inset-0 z-0 bg-[linear-gradient(140deg,#314f78_0%,#286c80_42%,#3f6da7_100%)] transition-transform duration-700 group-hover:scale-110" />
              )}

              <div className="absolute right-4 top-4 z-20">
                <ServiceActionsMenu
                  service={service}
                  disabled={disabled}
                  onEdit={onEdit}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                />
              </div>

              <div className="relative z-10 flex flex-col pt-20">
                <div className="flex-1">
                  <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-md">{service.name}</h3>
                  <p className="mb-4 mt-2 line-clamp-2 text-[13px] font-medium leading-relaxed text-zinc-300 drop-shadow-[var(--shadow-sm)]">
                    {service.description ? service.description : <span className="italic opacity-70">Sin descripción</span>}
                  </p>
                </div>

                <div className="flex items-end justify-between border-t border-white/20 pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                      {service.duration_minutes} min
                    </p>
                    <p className="mt-1 text-lg font-bold text-white drop-shadow">
                      {formatPrice(service.price)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${
                        service.is_active
                          ? "border-blue-300/80 bg-blue-500/30 text-white shadow-[0_2px_10px_-2px_rgba(59,130,246,0.5)]"
                          : "border-white/40 bg-zinc-900/60 text-zinc-200"
                      }`}
                    >
                      {service.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
