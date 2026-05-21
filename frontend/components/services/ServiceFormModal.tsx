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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--surface-0)]/50 p-4">
      <div className="dashboard-surface-1 w-full max-w-xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="dashboard-title text-lg font-semibold">{title}</h3>
            <p className="dashboard-text-secondary mt-1 text-sm">
              Configura nombre, imagen, duracion, precio y estado del servicio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="dashboard-surface-2 dashboard-focusable dashboard-interactive h-9 w-9 text-lg"
            aria-label="Cerrar"
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <Input
            id="service-name"
            label="Nombre"
            value={form.name}
            minLength={3}
            maxLength={120}
            onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
            required
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="service-category" className="text-sm font-medium text-[var(--text-secondary)] ">
              Categoría
            </label>
            {categoriesLoading ? (
              <div className="text-sm text-[var(--text-muted)]">Cargando categorías...</div>
            ) : (
              <select
                id="service-category"
                value={form.categoryId}
                onChange={(event) => setForm((previous) => ({ ...previous, categoryId: event.target.value }))}
                 className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--app-primary)] focus:outline-none dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:focus:border-[var(--app-primary)]"
                required
              >
                <option value="" disabled>Seleccione una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="service-description" className="text-sm font-medium text-[var(--text-secondary)] ">
              Descripcion
            </label>
            <textarea
              id="service-description"
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, description: event.target.value }))
              }
              rows={3}
               className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--app-primary)] focus:outline-none dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:placeholder:text-[var(--text-muted)] dark:focus:border-[var(--app-primary)]"
              placeholder="Opcional"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="service-image-file" className="text-sm font-medium text-[var(--text-secondary)] ">
              Imagen
            </label>
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
                setUploadMessage("Vista previa lista. Sube la imagen para obtener la URL final.");
              }}
               className="block w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--app-primary)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--surface-3)] hover:file:bg-[var(--app-primary-strong)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] "
            />
            <p className="dashboard-text-muted text-xs">
              Sube una imagen JPEG, PNG o WEBP de hasta 2MB. Esta es la captura principal.
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleUploadSelectedImage}
                disabled={uploadingImage || !selectedFile}
              >
                {uploadingImage ? "Subiendo imagen..." : "Subir imagen"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetSelectedImage} disabled={uploadingImage}>
                Limpiar
              </Button>
            </div>

            {previewUrl ? (
              <div className="mt-2">
                <p className="dashboard-text-muted mb-2 text-xs">Vista previa</p>
                <Image
                  src={previewUrl}
                  alt={form.name ? `Vista previa de ${form.name}` : "Vista previa de la imagen del servicio"}
                  width={640}
                  height={320}
                   className="h-40 w-full rounded-lg border border-[var(--border-strong)] object-cover dark:border-[var(--border-strong)]"
                  unoptimized
                />
              </div>
            ) : null}

             {uploadMessage ? <p className="text-[12px] font-medium text-[var(--color-info)]">{uploadMessage}</p> : null}
             {uploadError ? <p className="text-xs text-[var(--color-error)]">{uploadError}</p> : null}

            <div className="mt-2 flex flex-col gap-1">
              <label htmlFor="service-image-url" className="text-sm font-medium text-[var(--text-secondary)] ">
                URL manual opcional
              </label>
              <input
                id="service-image-url"
                type="url"
                value={form.imageUrl}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((previous) => ({ ...previous, imageUrl: value }));
                  if (!selectedFile) {
                    setPreviewUrl(value || null);
                  }
                }}
                placeholder="https://..."
                 className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--app-primary)] focus:outline-none dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:placeholder:text-[var(--text-muted)] dark:focus:border-[var(--app-primary)]"
              />
              <p className="dashboard-text-muted text-xs">
                Opcional. Puedes pegar una URL si no quieres subir archivo.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              id="service-duration"
              label="Duracion (min)"
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
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(event) => setForm((previous) => ({ ...previous, price: event.target.value }))}
              required
            />
          </div>

          <label className="dashboard-surface-2 flex min-h-11 items-center gap-2 px-3 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, isActive: event.target.checked }))
              }
            />
            Servicio activo
          </label>

           {validationError ? <p className="text-sm text-[var(--color-error)]">{validationError}</p> : null}
           {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving || uploadingImage} disabled={uploadingImage}>
              {mode === "create" ? "Crear" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
