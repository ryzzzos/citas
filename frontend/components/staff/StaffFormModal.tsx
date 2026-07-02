import { useEffect, useMemo, useState, type FormEvent } from "react";
import { sileo } from "sileo";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Staff, Service } from "@/types";
import { useServices } from "@/lib/services/useServices";
import { useStaff } from "@/lib/staff/useStaff";
import Image from "next/image";
import { ImagePlus } from "lucide-react";

interface StaffFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  staff?: Staff | null;
  saving?: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  serviceIds: string[];
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  isActive: true,
  serviceIds: [],
};

function toFormState(staff?: Staff | null): FormState {
  if (!staff) {
    return INITIAL_FORM_STATE;
  }
  return {
    name: staff.name,
    email: staff.email || "",
    phone: staff.phone || "",
    isActive: staff.is_active,
    serviceIds: staff.service_ids || [],
  };
}

export default function StaffFormModal({
  open,
  mode,
  staff,
  saving: isSubmitting,
  onClose,
}: StaffFormModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const { services, loading: loadingServices } = useServices();
  const { create, update, uploadPhoto } = useStaff();

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevStaff, setPrevStaff] = useState(staff);

  if (open !== prevOpen || staff !== prevStaff) {
    setPrevOpen(open);
    setPrevStaff(staff);
    if (open) {
      setForm(toFormState(staff));
      setPhotoFile(null);
      setPhotoPreview(staff?.photo_url || null);
      setValidationError(null);
    }
  }

  const title = useMemo(
    () => (mode === "create" ? "Agregar empleado" : "Editar empleado"),
    [mode]
  );

  function toggleService(serviceId: string) {
    setForm(prev => {
      const isSelected = prev.serviceIds.includes(serviceId);
      return {
        ...prev,
        serviceIds: isSelected 
          ? prev.serviceIds.filter(id => id !== serviceId)
          : [...prev.serviceIds, serviceId]
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (name.length < 2) {
      setValidationError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    const data = {
      name,
      email: email || undefined,
      phone: phone || undefined,
      is_active: form.isActive,
      service_ids: form.serviceIds,
    };

    const promise = (async () => {
      let savedStaff;
      if (mode === "create") {
        savedStaff = await create(data);
      } else if (staff) {
        savedStaff = await update(staff.id, data);
      }

      if (savedStaff && photoFile) {
        await uploadPhoto(savedStaff.id, photoFile);
      }
      return savedStaff;
    })();

    sileo.promise(promise, {
      loading: { title: mode === "create" ? "Agregando empleado..." : "Guardando cambios..." },
      success: { 
        title: mode === "create" ? "Empleado agregado" : "Cambios guardados",
        description: `"${name}" se guardó correctamente.`
      },
      error: (err) => ({ 
        title: "Error al guardar", 
        description: err instanceof Error ? err.message : "Inténtalo de nuevo." 
      }),
    });

    try {
      await promise;
      onClose();
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Error al guardar el empleado.");
    }
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
                  Configura los detalles y servicios de este empleado.
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
              {validationError && (
                <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error)]/10 p-3 text-[13px] font-medium text-[var(--color-error)]">
                  {validationError}
                </div>
              )}

              <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                  <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--app-primary)]">
                    Información Personal
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="Nombre completo"
                      placeholder="Ej. Juan Pérez"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      autoFocus
                    />
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Email (Opcional)"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                      <Input
                        label="Teléfono (Opcional)"
                        type="tel"
                        placeholder="Ej. +1 234 567 8900"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[13px] font-semibold text-[var(--text-primary)]">Foto del empleado (Opcional)</label>
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)]">
                          {photoPreview ? (
                            <Image src={photoPreview} alt="Preview" fill className="object-cover" unoptimized />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                              <ImagePlus className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] focus-within:ring-2 focus-within:ring-[var(--app-primary)]">
                            <span>Subir imagen</span>
                            <input
                              type="file"
                              accept="image/jpeg, image/png, image/webp"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    setValidationError("La imagen no debe superar los 2MB.");
                                    return;
                                  }
                                  setPhotoFile(file);
                                  setPhotoPreview(URL.createObjectURL(file));
                                  setValidationError(null);
                                }
                              }}
                            />
                          </label>
                          <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                            JPEG, PNG o WEBP. Máx 2MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                  <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--app-primary)]">
                    Servicios Asignados
                  </h4>
                  <p className="mb-4 text-xs text-[var(--text-muted)]">
                    Selecciona qué servicios de la empresa puede realizar este empleado en esta sucursal.
                  </p>
                  
                  {loadingServices ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-[var(--app-primary)]" />
                    </div>
                  ) : services.length === 0 ? (
                    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-4 text-center">
                      <p className="text-sm text-[var(--text-muted)]">No hay servicios creados aún.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {services.map(service => (
                        <label 
                          key={service.id} 
                          className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-2)] p-3 transition-colors hover:border-[var(--app-primary)]/50"
                        >
                          <input
                            type="checkbox"
                            checked={form.serviceIds.includes(service.id)}
                            onChange={() => toggleService(service.id)}
                            className="h-4 w-4 rounded border-[var(--border-strong)] bg-transparent text-[var(--app-primary)] focus:ring-[var(--app-primary)] focus:ring-offset-0 focus:ring-offset-transparent"
                          />
                          <div className="flex min-w-0 flex-1 items-center justify-between">
                            <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                              {service.name}
                            </span>
                            <span className="ml-2 shrink-0 text-xs text-[var(--text-muted)]">
                              {service.duration_minutes} min
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
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
                      <span className="text-[14px] font-semibold text-[var(--text-primary)]">Empleado activo</span>
                      <span className="text-[13px] text-[var(--text-muted)]">
                        Al desactivar, se ocultará de la agenda y reservas.
                      </span>
                    </div>
                  </label>
                </div>
              </form>
            </div>

            <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-5">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting} className="bg-[var(--surface-3)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Cancelar
              </Button>
              <Button type="submit" form="staff-form" disabled={isSubmitting} className="min-w-[120px] bg-[linear-gradient(90deg,var(--app-primary),var(--app-primary-strong))] border border-[var(--border-soft)] shadow-[var(--shadow-sm)] text-[var(--surface-3)]">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--surface-3)]" />
                ) : mode === "create" ? (
                  "Guardar empleado"
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
