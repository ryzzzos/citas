import Button from "@/components/ui/Button";
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
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => onEdit(service)}
        className="rounded-lg px-3 py-1.5 text-xs"
      >
        Editar
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => onToggleActive(service)}
        className="rounded-lg px-3 py-1.5 text-xs"
      >
        {service.is_active ? "Desactivar" : "Activar"}
      </Button>
      <Button
        type="button"
        variant="danger"
        disabled={disabled}
        onClick={() => onDelete(service)}
        className="rounded-lg px-3 py-1.5 text-xs"
      >
        Eliminar
      </Button>
    </div>
  );
}
