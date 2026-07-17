import Button from "@/components/ui/Button";
import { BriefcaseBusiness, CheckCircle2, Plus, Tags, CircleDollarSign } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import type { Service } from "@/types";

interface ServicesHeaderProps {
  services: Service[];
  onCreate: () => void;
  onManageCategories: () => void;
}

export default function ServicesHeader({ services, onCreate, onManageCategories }: ServicesHeaderProps) {
  const activeServices = services.filter((service) => service.is_active);
  const activeCount = activeServices.length;
  
  const validPrices = activeServices.map(s => Number(s.price)).filter(n => !isNaN(n));
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
  
  const formatPrice = (p: number) => new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(p);

  const priceRange = validPrices.length === 0 
    ? formatPrice(0)
    : minPrice === maxPrice 
      ? formatPrice(minPrice) 
      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
      
  const categoriesCount = new Set(activeServices.map(s => s.service_category_id).filter(Boolean)).size;

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1.5 max-w-2xl text-[14px] font-medium leading-relaxed text-[var(--text-secondary)]">
            Gestiona tu catálogo de servicios, precios y disponibilidad.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="secondary" 
            onClick={onManageCategories} 
            className="flex-1 sm:flex-none relative min-h-11 rounded-full px-5 shadow-[var(--shadow-sm)] transition-all active:scale-[0.98] border border-[var(--border-strong)] bg-[var(--surface-3)] hover:bg-[var(--surface-2)]"
          >
            <AppIcon icon={Tags} className="mr-2 text-[var(--text-secondary)]" size="sm" />
            <span className="font-semibold text-[13px] tracking-tight text-[var(--text-primary)]">Categorías</span>
          </Button>

          <Button 
            onClick={onCreate} 
            className="flex-1 sm:flex-none relative min-h-11 rounded-full px-5 shadow-[var(--shadow-md)] transition-all hover:brightness-110 active:scale-[0.98] bg-[linear-gradient(90deg,var(--app-primary),var(--app-primary-strong))] text-[var(--surface-3)] border border-[var(--border-soft)]"
          >
            <AppIcon icon={Plus} className="mr-2" size="sm" />
            <span className="font-semibold text-[13px] tracking-tight">Nuevo</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Catálogo Activo */}
        <article className="flex flex-1 items-center justify-between rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-info)_8%,var(--surface-3)),var(--surface-3))] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-info)] text-[var(--surface-3)] shadow-[var(--shadow-sm)]">
              <AppIcon icon={CheckCircle2} size="sm" />
            </div>
            <p className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">Catálogo activo</p>
          </div>
          <p className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">{activeCount}</p>
        </article>

        {/* Categorías */}
        <article className="flex flex-1 items-center justify-between rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary)_8%,var(--surface-3)),var(--surface-3))] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-primary)] text-[var(--surface-3)] shadow-[var(--shadow-sm)]">
              <AppIcon icon={Tags} size="sm" />
            </div>
            <p className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">Categorías</p>
          </div>
          <p className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">{categoriesCount}</p>
        </article>

        {/* Rango de Precios */}
        <article className="flex flex-1 items-center justify-between rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-success)_8%,var(--surface-3)),var(--surface-3))] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-success)] text-[var(--surface-3)] shadow-[var(--shadow-sm)]">
              <AppIcon icon={CircleDollarSign} size="sm" />
            </div>
            <p className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">Rango precios</p>
          </div>
          <p className="text-[20px] sm:text-[22px] font-bold tracking-tight text-[var(--text-primary)]">{priceRange}</p>
        </article>
      </div>
    </header>
  );
}
