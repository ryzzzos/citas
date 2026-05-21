import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { CreateServiceInput, Service } from "@/types";

interface ServiceFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  service?: Service | null;
  saving?: boolean;
  error?: string | null;
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

import { useServiceCategories } from "@/lib/services/useServiceCategories";

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

  const { categories, loading: categoriesLoading } = useServiceCategories();

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
  }, [open, service]);

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

  if (!open) {
    return null;
  }

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

  async function handleUploadSelectedImage() {
    if (!selectedFile) {
      setUploadError("Selecciona una imagen primero.");
      return;
    }

    const validation = validateSelectedFile(selectedFile);
    if (validation) {
      setUploadError(validation);
      return;
    }

    setUploadingImage(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const result = await onUploadImage(selectedFile);
      setForm((previous) => ({ ...previous, imageUrl: result.image_url }));
      setPreviewUrl(result.image_url);
      setSelectedFile(null);
      setUploadMessage("Imagen subida correctamente.");
    } catch (uploadErr) {
      setUploadError(uploadErr instanceof Error ? uploadErr.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
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

    if (selectedFile) {
      setValidationError("Sube la imagen seleccionada antes de guardar el servicio.");
      return;
    }

    if (imageUrl.length > 0 && !isValidHttpImageUrl(imageUrl)) {
      setValidationError("La imagen debe ser una URL valida con http o https.");
      return;
    }

    await onSubmit({
      name,
      description: form.description.trim() || null,
      image_url: imageUrl || null,
      duration_minutes: duration,
      price: price.toFixed(2),
      is_active: form.isActive,
      service_category_id: categoryId || null,
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--surface-0)]/60 backdrop-blur-md p-4 sm:p-6 transition-all duration-300">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-2xl max-h-[95vh]">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-3)]/90 px-6 py-5 backdrop-blur-md">
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
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
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
                    <div className="relative">
                      <select
                        id="service-category"
                        value={form.categoryId}
                        onChange={(event) => setForm((previous) => ({ ...previous, categoryId: event.target.value }))}
                        className="w-full h-11 pl-3 pr-8 rounded-lg bg-[var(--surface-1)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[var(--app-primary)] focus:ring-1 focus:ring-[var(--app-primary)] transition-all cursor-pointer"
                        required
                      >
                        <option value="" disabled>Seleccione una categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
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
                    className="w-full rounded-lg bg-[var(--surface-1)] border border-[var(--border-strong)] px-3 py-2.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-1 focus:ring-[var(--app-primary)] transition-all"
                    placeholder="Escribe una breve descripción (opcional)"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Pricing & Timing */}
            <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
              <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">Precio y Duración</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="service-duration"
                  label="Duración (minutos)"
                  type="number"
                  min={1}
                  max={720}
                  value={form.duration}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, duration: event.target.value }))
                  }
                  required
                />
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
                <div className="flex flex-col gap-1.5">
                  <input
                    id="service-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
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
                      setUploadMessage("Vista previa lista. Sube la imagen para confirmarla.");
                    }}
                    className="block w-full text-[13px] text-[var(--text-secondary)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--surface-1)] file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[var(--text-primary)] hover:file:bg-[var(--border-strong)] transition-all cursor-pointer"
                  />
                  <p className="text-[12px] text-[var(--text-muted)] mt-1">
                    Formatos soportados: JPEG, PNG o WEBP. Peso máximo: 2MB.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleUploadSelectedImage}
                    disabled={uploadingImage || !selectedFile}
                  >
                    {uploadingImage ? "Subiendo..." : "Subir imagen"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetSelectedImage} disabled={uploadingImage}>
                    Limpiar
                  </Button>
                </div>

                {previewUrl ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--surface-1)]">
                    <Image
                      src={previewUrl}
                      alt={form.name ? `Vista previa de ${form.name}` : "Vista previa de la imagen del servicio"}
                      width={640}
                      height={320}
                      className="h-40 w-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}

                {uploadMessage ? <p className="text-[13px] font-medium text-[var(--color-info)]">{uploadMessage}</p> : null}
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
          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-[var(--border-strong)] bg-[var(--surface-3)]/90 px-6 py-4 backdrop-blur-md">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving || uploadingImage} disabled={uploadingImage}>
              {mode === "create" ? "Crear Servicio" : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
