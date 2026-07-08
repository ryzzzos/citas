
import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { CreateServiceInput, Service, ServiceCategory } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2 } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

interface ServiceFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  service?: Service | null;
  saving?: boolean;
  error?: string | null;
  categories: ServiceCategory[];
  categoriesLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServiceInput) => Promise<void>;
  onUploadImage: (file: File) => Promise<{ image_url: string }>;
}

interface FormState {
  name: string;
  description: string;
  imageUrl: string;
  duration: string;
  price: string;
  isActive: boolean;
  categoryId: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  description: "",
  imageUrl: "",
  duration: "30",
  price: "0",
  isActive: true,
  categoryId: "",
};

function toFormState(service?: Service | null): FormState {
  if (!service) {
    return INITIAL_FORM_STATE;
  }

  return {
    name: service.name,
    description: service.description ?? "",
    imageUrl: service.image_url ?? "",
    duration: String(service.duration_minutes),
    price: service.price,
    isActive: service.is_active,
    categoryId: service.service_category_id ?? "",
  };
}

function isValidHttpImageUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ServiceFormModal({
  open,
  mode,
  service,
  saving,
  error,
  categories,
  categoriesLoading,
  onClose,
  onSubmit,
  onUploadImage,
}: ServiceFormModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const state = toFormState(service);
    if (!state.categoryId && categories.length > 0) {
      const sinCategoria = categories.find((c) => c.name === "Sin categoría");
      state.categoryId = sinCategoria ? sinCategoria.id : categories[0].id;
    }

    setForm(state);
    setValidationError(null);
    setUploadingImage(false);
    setUploadMessage(null);
    setUploadError(null);
    setSelectedFile(null);
    setPreviewUrl(service?.image_url ?? null);
  }, [open, service, categories]);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const title = useMemo(
    () => (mode === "create" ? "Crear servicio" : "Editar servicio"),
    [mode]
  );



  function resetSelectedImage() {
    setSelectedFile(null);
    setPreviewUrl(form.imageUrl || service?.image_url || null);
    setUploadMessage(null);
    setUploadError(null);
  }

  function validateSelectedFile(file: File): string | null {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Solo se permiten archivos JPEG, PNG o WEBP.";
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return "El archivo debe pesar 2MB o menos.";
    }

    return null;
  }



  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const name = form.name.trim();
    const imageUrl = form.imageUrl.trim();
    const duration = Number(form.duration);
    const price = Number(form.price);
    const categoryId = form.categoryId;

    if (name.length < 3) {
      setValidationError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    if (!categoryId) {
      setValidationError("Debe seleccionar una categoría.");
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      setValidationError("La duracion debe ser mayor a 0.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setValidationError("El precio debe ser mayor o igual a 0.");
      return;
    }

    let finalImageUrl = imageUrl;

    if (selectedFile) {
      setUploadingImage(true);
      try {
        const result = await onUploadImage(selectedFile);
        finalImageUrl = result.image_url;
      } catch (err) {
        setValidationError(err instanceof Error ? err.message : "Error al subir la imagen");
        setUploadingImage(false);
        return;
      }
    }

    if (finalImageUrl.length > 0 && !isValidHttpImageUrl(finalImageUrl)) {
      setValidationError("La imagen debe ser una URL valida con http o https.");
      setUploadingImage(false);
      return;
    }

    try {
      await onSubmit({
        name,
        description: form.description.trim() || null,
        image_url: finalImageUrl || null,
        duration_minutes: duration,
        price: price.toFixed(2),
        is_active: form.isActive,
        service_category_id: categoryId || null,
      });
    } finally {
      setUploadingImage(false);
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
            {/* Sticky Header */}
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-5">
              <div>
            <h3 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">{title}</h3>
            <p className="text-[13.5px] text-[var(--text-secondary)] mt-0.5">
              Configura los detalles de este servicio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)] transition-colors hover:bg-[var(--border-strong)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Group 1: General Info */}
            <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">Información General</h4>
              <div className="space-y-4">
                <Input
                  id="service-name"
                  label="Nombre del Servicio"
                  value={form.name}
                  minLength={3}
                  maxLength={120}
                  onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="service-category" className="text-[13px] font-semibold text-[var(--text-secondary)]">
                    Categoría
                  </label>
                  {categoriesLoading ? (
                    <div className="text-[13px] text-[var(--text-muted)] py-2">Cargando categorías...</div>
                  ) : (
                    <CustomSelect<string>
                      id="service-category"
                      value={form.categoryId}
                      onChange={(val) => setForm((prev) => ({ ...prev, categoryId: val }))}
                      options={categories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      }))}
                      placeholder="Seleccione una categoría"
                      buttonClassName="!h-[3.25rem] !rounded-[1.125rem] !bg-[var(--surface-2)]"
                      menuClassName="!rounded-[1.125rem]"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="service-description" className="text-[13px] font-semibold text-[var(--text-secondary)]">
                    Descripción
                  </label>
                  <textarea
                    id="service-description"
                    value={form.description}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, description: event.target.value }))
                    }
                    rows={3}
                    className="dashboard-focusable w-full rounded-[1.125rem] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3.5 text-[0.925rem] font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--app-primary)] focus:bg-[var(--surface-1)] dark:bg-[var(--surface-2)] dark:focus:bg-[var(--surface-1)] resize-none"
                    placeholder="Escribe una breve descripción (opcional)"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Pricing & Timing */}
            <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">Precio y Duración</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="service-duration" className="text-[13px] font-semibold text-[var(--text-secondary)]">
                    Duración
                  </label>
                  <div className="relative">
                    <select
                      id="service-duration"
                      value={form.duration}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, duration: event.target.value }))
                      }
                      className="dashboard-focusable w-full h-[3.25rem] pl-4 pr-8 rounded-[1.125rem] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[0.925rem] font-medium text-[var(--text-primary)] appearance-none transition-colors focus:border-[var(--app-primary)] focus:bg-[var(--surface-1)] dark:bg-[var(--surface-2)] dark:focus:bg-[var(--surface-1)] cursor-pointer"
                      required
                    >
                      {Array.from({ length: 48 }, (_, i) => (i + 1) * 15).map((mins) => {
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        const label = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m} min`;
                        return (
                          <option key={mins} value={mins}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <Input
                  id="service-price"
                  label="Precio (CLP)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((previous) => ({ ...previous, price: event.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Group 3: Media */}
            <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">Imagen del Servicio</h4>
              <div className="flex flex-col gap-4">
                <label
                  className={`dashboard-focusable group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.25rem] border border-[var(--border-strong)] bg-[var(--surface-2)] transition-colors hover:bg-[var(--surface-1)] dark:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-1)] aspect-[16/10] ${uploadingImage ? "pointer-events-none opacity-60" : ""}`}
                >
                  {previewUrl && (
                    <Image src={previewUrl} alt="" fill className="object-cover" unoptimized />
                  )}
                  <div
                    className={`relative z-10 flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-full px-4 py-3 text-center transition-all duration-300 ${
                      previewUrl
                        ? "border border-[var(--glass-border)] bg-[var(--surface-glass)] text-[var(--text-primary)] backdrop-blur-md backdrop-saturate-150 group-hover:bg-[var(--surface-glass)]"
                        : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5" strokeWidth={2.5} />
                        <span className="text-[0.75rem] font-bold uppercase tracking-wider">
                          {previewUrl ? "Cambiar" : "Elegir"}
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (!file) {
                        resetSelectedImage();
                        return;
                      }

                      const validation = validateSelectedFile(file);
                      if (validation) {
                        setSelectedFile(null);
                        setUploadError(validation);
                        setUploadMessage(null);
                        return;
                      }

                      setSelectedFile(file);
                      setUploadError(null);
                      setUploadMessage(null);
                      setForm((prev) => ({ ...prev, imageUrl: "" }));
                    }}
                    disabled={uploadingImage}
                  />
                </label>
                <p className="text-[12px] text-[var(--text-muted)] mt-1">
                  Formatos soportados: JPEG, PNG o WEBP. Peso máximo: 2MB.
                </p>

                {uploadError ? <p className="text-[13px] font-medium text-[var(--color-error)]">{uploadError}</p> : null}

                <div className="pt-2">
                  <Input
                    id="service-image-url"
                    label="URL de imagen externa (Opcional)"
                    type="url"
                    value={form.imageUrl}
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm((previous) => ({ ...previous, imageUrl: value }));
                      if (!selectedFile) {
                        setPreviewUrl(value || null);
                      }
                    }}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Group 4: Status */}
            <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] flex items-center justify-between">
              <div>
                <h4 className="text-[14px] font-semibold text-[var(--text-primary)]">Estado del Servicio</h4>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Controla si este servicio es visible y puede ser reservado por tus clientes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.isActive}
                  onChange={(event) => setForm((previous) => ({ ...previous, isActive: event.target.checked }))}
                />
                <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--app-primary)] peer-focus:ring-offset-2 peer-focus:ring-offset-[var(--surface-3)] transition-colors ${form.isActive ? 'bg-[var(--app-primary)]' : 'bg-[var(--surface-1)] border border-[var(--border-strong)]'}`}>
                  <div className={`absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'} shadow-sm`}></div>
                </div>
              </label>
            </div>

            {validationError ? (
              <div className="rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)] p-3">
                <p className="text-[13px] font-medium text-[var(--color-error)]">{validationError}</p>
              </div>
            ) : null}
            {error ? (
              <div className="rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)] p-3">
                <p className="text-[13px] font-medium text-[var(--color-error)]">{error}</p>
              </div>
            ) : null}
          </div>

          {/* Sticky Footer */}
          <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving || uploadingImage} disabled={uploadingImage}>
              {mode === "create" ? "Crear Servicio" : "Guardar Cambios"}
            </Button>
          </footer>
        </form>
        </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
