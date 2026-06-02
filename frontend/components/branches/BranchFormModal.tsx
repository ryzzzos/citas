import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Branch, CreateBranchInput, UpdateBranchInput } from "@/types";

interface BranchFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  branch?: Branch | null;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (data: CreateBranchInput | UpdateBranchInput) => Promise<void>;
}

interface FormState {
  name: string;
  address: string;
  city: string;
  phone: string;
  whatsappPhone: string;
  isActive: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  address: "",
  city: "",
  phone: "",
  whatsappPhone: "",
  isActive: true,
};

function toFormState(branch?: Branch | null): FormState {
  if (!branch) {
    return INITIAL_FORM_STATE;
  }
  return {
    name: branch.name,
    address: branch.address,
    city: branch.city,
    phone: branch.phone || "",
    whatsappPhone: branch.whatsapp_phone || "",
    isActive: branch.is_active,
  };
}

export default function BranchFormModal({
  open,
  mode,
  branch,
  saving,
  error,
  onClose,
  onSubmit,
}: BranchFormModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevBranch, setPrevBranch] = useState(branch);

  if (open !== prevOpen || branch !== prevBranch) {
    setPrevOpen(open);
    setPrevBranch(branch);
    if (open) {
      setForm(toFormState(branch));
      setValidationError(null);
    }
  }

  const title = useMemo(
    () => (mode === "create" ? "Crear sucursal" : "Editar sucursal"),
    [mode]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const name = form.name.trim();
    const address = form.address.trim();
    const city = form.city.trim();
    const phone = form.phone.trim();
    const whatsappPhone = form.whatsappPhone.trim();

    if (name.length < 3) {
      setValidationError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if (address.length < 5) {
      setValidationError("La dirección debe tener al menos 5 caracteres.");
      return;
    }
    if (city.length < 2) {
      setValidationError("La ciudad debe tener al menos 2 caracteres.");
      return;
    }

    await onSubmit({
      name,
      address,
      city,
      phone: phone || undefined,
      whatsapp_phone: whatsappPhone || null,
      is_active: form.isActive,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            role="presentation"
            className="fixed inset-0 z-[80] bg-[var(--text-primary)]/10 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-auto fixed right-4 sm:right-6 top-0 bottom-0 my-auto z-[80] flex w-[90vw] max-w-[500px] h-[95vh] flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)] xl:max-w-[540px]"
            aria-hidden={!open}
          >
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-5">
              <div>
                <h3 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">{title}</h3>
                <p className="mt-0.5 text-[13.5px] text-[var(--text-secondary)]">
                  Configura los detalles de esta sede.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)] transition-colors hover:bg-[var(--border-strong)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
                aria-label="Cerrar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border-strong)]">
              {(error || validationError) && (
                <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error)]/10 p-3 text-[13px] font-medium text-[var(--color-error)]">
                  {error || validationError}
                </div>
              )}

              <form id="branch-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                  <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--app-primary)]">
                    Información Principal
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="Nombre de la sucursal"
                      placeholder="Ej. Sede Norte"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      autoFocus
                    />
                    
                    <Input
                      label="Teléfono de contacto (Opcional)"
                      type="tel"
                      placeholder="Ej. +1 234 567 8900"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />

                    <Input
                      label="WhatsApp de la sucursal (Opcional)"
                      type="tel"
                      placeholder="Ej. +1 234 567 8900"
                      value={form.whatsappPhone}
                      onChange={(e) => setForm({ ...form, whatsappPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                  <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--app-primary)]">
                    Ubicación Geográfica
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="Dirección"
                      placeholder="Ej. Av. Siempreviva 742"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      required
                    />
                    
                    <Input
                      label="Ciudad"
                      placeholder="Ej. Springfield"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                  <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--app-primary)]">
                    Estado
                  </h4>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-2)] p-4 transition-colors hover:border-[var(--app-primary)]/50">
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-[var(--border-strong)] bg-transparent text-[var(--app-primary)] focus:ring-[var(--app-primary)] focus:ring-offset-0 focus:ring-offset-transparent"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-[var(--text-primary)]">Sucursal activa</span>
                      <span className="text-[13px] text-[var(--text-muted)]">
                        Las sucursales inactivas no aparecen en el mapa público ni permiten agendamientos.
                      </span>
                    </div>
                  </label>
                </div>
              </form>
            </div>

            <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-5">
              <Button type="button" variant="secondary" onClick={onClose} disabled={saving} className="bg-[var(--surface-3)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Cancelar
              </Button>
              <Button type="submit" form="branch-form" disabled={saving} className="min-w-[120px] bg-[linear-gradient(180deg,var(--app-primary),var(--app-primary-strong))] border border-[var(--border-soft)] shadow-[var(--shadow-sm)] text-[var(--surface-3)]">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--surface-3)]" />
                ) : mode === "create" ? (
                  "Crear sucursal"
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
