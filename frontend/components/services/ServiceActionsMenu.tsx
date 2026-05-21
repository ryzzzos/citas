import { Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import type { Service } from "@/types";

interface ServiceActionsMenuProps {
  service: Service;
  disabled?: boolean;
  onEdit: (service: Service) => void;
  onToggleActive: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export default function ServiceActionsMenu({
  service,
  disabled,
  onEdit,
  onToggleActive,
  onDelete,
}: ServiceActionsMenuProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEdit(service)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--app-primary)] disabled:opacity-50"
        title="Editar servicio"
        aria-label="Editar servicio"
      >
        <AppIcon icon={Pencil} size="sm" />
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggleActive(service)}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
          service.is_active 
            ? "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--color-pending)]" 
            : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--color-info)]"
        }`}
        title={service.is_active ? "Desactivar servicio" : "Activar servicio"}
        aria-label={service.is_active ? "Desactivar servicio" : "Activar servicio"}
      >
        <AppIcon icon={service.is_active ? PowerOff : Power} size="sm" />
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onDelete(service)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--color-error)] disabled:opacity-50"
        title="Eliminar servicio"
        aria-label="Eliminar servicio"
      >
        <AppIcon icon={Trash2} size="sm" />
      </button>
    </div>
  );
}
