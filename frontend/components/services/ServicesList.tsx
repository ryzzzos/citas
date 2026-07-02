import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import ServiceActionsMenu from "@/components/services/ServiceActionsMenu";
import type { Service, ServiceCategory } from "@/types";

interface ServicesListProps {
  services: Service[];
  disabled?: boolean;
  viewMode: "grid" | "list";
  onEdit: (service: Service) => void;
  onToggleActive: (service: Service) => void;
  onDelete: (service: Service) => void;
  categories: ServiceCategory[];
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
  if (!service.image_url) {
    return (
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-1)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] border border-[var(--border-strong)]"
        aria-label="Sin imagen"
      >
        Sin
      </div>
    );
  }

  return (
    <Image
      src={service.image_url}
      alt={`Imagen ${service.name}`}
      width={48}
      height={48}
      className="h-12 w-12 shrink-0 rounded-lg object-cover border border-[var(--border-strong)]"
      loading="lazy"
      unoptimized
    />
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-[var(--shadow-sm)] ${
      active 
        ? "border-[var(--color-info)]/20 bg-[var(--surface-glass)] text-[var(--color-info)]"
        : "border-[var(--border-strong)] bg-[var(--surface-glass)] text-[var(--text-secondary)]"
    }`}>
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

export default function ServicesList({
  services,
  disabled,
  viewMode,
  onEdit,
  onToggleActive,
  onDelete,
  categories,
}: ServicesListProps) {

  return (
    <section className="flex flex-col gap-5">
      {viewMode === "list" ? (
        <div className="flex flex-col gap-3">
          {services.map((service) => {
            const category = categories.find(c => c.id === service.service_category_id);
            return (
            <article
              key={service.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <ServiceThumbnail service={service} />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[16px] font-bold tracking-tight text-[var(--text-primary)] truncate">
                      {service.name}
                    </h3>
                    <StatusBadge active={service.is_active} />
                    {category && (
                      <span className="hidden sm:inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        {category.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13.5px] text-[var(--text-secondary)] line-clamp-1">
                    {service.description || "Sin descripción"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-[320px] shrink-0 pl-16 sm:pl-0">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Duración</span>
                    <span className="mt-0.5 text-[14px] font-medium text-[var(--text-primary)]">{service.duration_minutes} min</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Precio</span>
                    <span className="mt-0.5 text-[14px] font-bold text-[var(--text-primary)]">{formatPrice(service.price)}</span>
                  </div>
                </div>
                
                <div className="h-10 w-[1px] bg-[var(--border-strong)] hidden sm:block" />
                
                <ServiceActionsMenu
                  service={service}
                  disabled={disabled}
                  onEdit={onEdit}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                />
              </div>
            </article>
          )})}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => {
            const category = categories.find(c => c.id === service.service_category_id);
            return (
            <article
              key={service.id}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <div className="relative aspect-[16/9] w-full bg-[var(--surface-1)] overflow-hidden border-b border-[var(--border-strong)]">
                {service.image_url ? (
                  <Image
                    src={service.image_url}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-1)]">
                    <AppIcon icon={LayoutGrid} className="text-[var(--border-strong)]" size="lg" />
                  </div>
                )}
                <div className="absolute left-3 top-3 z-10 flex flex-col gap-2 items-start">
                  <StatusBadge active={service.is_active} />
                </div>
                <div className="absolute right-3 top-3 z-10 rounded-full border border-[var(--border-strong)] bg-[var(--surface-glass)] p-0.5 shadow-[var(--shadow-sm)] backdrop-blur-md backdrop-saturate-150 transition-opacity">
                  <ServiceActionsMenu
                    service={service}
                    disabled={disabled}
                    onEdit={onEdit}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[17px] font-bold tracking-tight text-[var(--text-primary)] line-clamp-1">
                    {service.name}
                  </h3>
                  {category && (
                    <span className="shrink-0 inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      {category.name}
                    </span>
                  )}
                </div>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-[var(--text-secondary)] line-clamp-2">
                  {service.description || "Sin descripción disponible."}
                </p>

                <div className="mt-5 flex items-center justify-between pt-4 border-t border-[var(--border-soft)]">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Duración</span>
                    <span className="mt-0.5 text-[14px] font-medium text-[var(--text-primary)]">{service.duration_minutes} min</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Precio</span>
                    <span className="mt-0.5 text-[15px] font-bold text-[var(--text-primary)]">{formatPrice(service.price)}</span>
                  </div>
                </div>
              </div>
            </article>
          )})}
        </div>
      )}
    </section>
  );
}
