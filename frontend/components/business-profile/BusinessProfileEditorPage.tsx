"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import BusinessProfileView from "@/components/business-profile/BusinessProfileView";
import { useBusinessProfileEditor } from "@/lib/business-profile/useBusinessProfileEditor";

function FieldLabel({ htmlFor, label }: { htmlFor: string; label: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
      {label}
    </label>
  );
}

export default function BusinessProfileEditorPage() {
  const {
    business,
    services,
    draft,
    previewBusiness,
    loading,
    saving,
    error,
    slugAvailable,
    checkingSlug,
    setDraftField,
    checkSlug,
    saveProfile,
    uploadCover,
    uploadLogo,
    suggestSlugFromName,
    reload,
  } = useBusinessProfileEditor();

  const [successMessage, setSuccessMessage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const bioCounter = useMemo(() => `${draft.public_bio.length}/280`, [draft.public_bio]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSuccessMessage("");

    try {
      await saveProfile();
      setSuccessMessage("Perfil actualizado correctamente.");
      setIsEditing(false);
    } catch {
      setSuccessMessage("");
    }
  }

  async function onCoverUpload(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      await uploadCover(file);
      setSuccessMessage("Portada actualizada correctamente.");
    } catch {
      setSuccessMessage("");
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  }

  async function onLogoUpload(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      await uploadLogo(file);
      setSuccessMessage("Logo actualizado correctamente.");
    } catch {
      setSuccessMessage("");
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="dashboard-surface-1 flex min-h-[55vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-teal-500 dark:border-slate-700 dark:border-t-teal-300" />
      </div>
    );
  }

  if (!business || !previewBusiness) {
    return (
      <section className="dashboard-surface-1 flex min-h-[55vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="dashboard-title text-lg font-semibold">No se pudo cargar el perfil de negocio</p>
        <Button onClick={reload}>Reintentar</Button>
      </section>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
      className={`grid min-h-0 flex-1 gap-5 ${
        isEditing ? "xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]" : "grid-cols-1"
      }`}
      >
      <div
        aria-hidden={!isEditing}
        className={`min-h-0 overflow-y-auto pr-1 transition-all duration-300 ease-out motion-reduce:transition-none ${
          isEditing
            ? "max-h-[2400px] opacity-100 translate-x-0"
            : "pointer-events-none max-h-0 opacity-0 -translate-x-3"
        }`}
      >
        <section className="dashboard-surface-1 p-4 md:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            Editor de perfil
          </p>
          <h2 className="dashboard-title mt-2 text-xl font-semibold">Perfil de negocio</h2>
          <p className="dashboard-text-secondary mt-2 text-sm">Configura la identidad visual y publica de tu negocio.</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-1.5">
            <FieldLabel htmlFor="name" label="Nombre del negocio" />
            <input
              id="name"
              type="text"
              required
              value={draft.name}
              onChange={(event) => setDraftField("name", event.target.value)}
              disabled={!isEditing}
              className="dashboard-focusable rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="category" label="Categoria" />
              <input
                id="category"
                type="text"
                required
                value={draft.category}
                onChange={(event) => setDraftField("category", event.target.value)}
                disabled={!isEditing}
                className="dashboard-focusable rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <div className="grid gap-1.5">
              <FieldLabel htmlFor="city" label="Ciudad" />
              <input
                id="city"
                type="text"
                required
                value={draft.city}
                onChange={(event) => setDraftField("city", event.target.value)}
                disabled={!isEditing}
                className="dashboard-focusable rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <FieldLabel htmlFor="address" label="Direccion" />
            <input
              id="address"
              type="text"
              required
              value={draft.address}
              onChange={(event) => setDraftField("address", event.target.value)}
              disabled={!isEditing}
              className="dashboard-focusable rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="slug" label="Slug publico" />
              <button
                type="button"
                onClick={suggestSlugFromName}
                disabled={!isEditing}
                className="dashboard-focusable text-xs font-semibold uppercase tracking-[0.1em] text-teal-700 underline underline-offset-4 dark:text-teal-300"
              >
                generar desde nombre
              </button>
            </div>
            <div className="flex gap-2">
              <input
                id="slug"
                type="text"
                required
                value={draft.slug}
                onChange={(event) => setDraftField("slug", event.target.value.toLowerCase())}
                disabled={!isEditing}
                className="dashboard-focusable flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                aria-describedby="slug-helper"
              />
              <Button type="button" variant="secondary" onClick={checkSlug} isLoading={checkingSlug}>
                Validar
              </Button>
            </div>
            <p id="slug-helper" className="text-xs text-zinc-500 dark:text-zinc-400">
              URL publica: /{draft.slug || "tu-negocio"}
            </p>
            {slugAvailable === true ? (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Slug disponible.</p>
            ) : null}
            {slugAvailable === false ? (
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
                Slug no disponible o invalido.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="phone" label="Telefono" />
              <input
                id="phone"
                type="tel"
                required
                value={draft.phone}
                onChange={(event) => setDraftField("phone", event.target.value)}
                disabled={!isEditing}
                className="dashboard-focusable rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <div className="grid gap-1.5">
              <FieldLabel htmlFor="whatsapp_phone" label="WhatsApp" />
              <input
                id="whatsapp_phone"
                type="tel"
                value={draft.whatsapp_phone}
                onChange={(event) => setDraftField("whatsapp_phone", event.target.value)}
                disabled={!isEditing}
                className="dashboard-focusable rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <FieldLabel htmlFor="email" label="Correo" />
            <input
              id="email"
              type="email"
              required
              value={draft.email}
              onChange={(event) => setDraftField("email", event.target.value)}
              disabled={!isEditing}
              className="dashboard-focusable rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="public_bio" label="Bio publica" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{bioCounter}</span>
            </div>
            <textarea
              id="public_bio"
              value={draft.public_bio}
              onChange={(event) => setDraftField("public_bio", event.target.value.slice(0, 280))}
              rows={4}
              disabled={!isEditing}
              className="dashboard-focusable rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="dashboard-surface-2 dashboard-focusable block cursor-pointer p-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {uploadingCover ? "Subiendo portada..." : "Subir portada"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={onCoverUpload}
                disabled={uploadingCover || !isEditing}
              />
            </label>

            <label className="dashboard-surface-2 dashboard-focusable block cursor-pointer p-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {uploadingLogo ? "Subiendo logo..." : "Subir logo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={onLogoUpload}
                disabled={uploadingLogo || !isEditing}
              />
            </label>
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-300/60 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-xl border border-emerald-300/60 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {successMessage}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" className="w-full" isLoading={saving}>
              Guardar perfil
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
              Cerrar
            </Button>
          </div>
        </form>
        </section>
      </div>

      <div className="-mt-5 min-h-0 overflow-y-auto pr-1 sm:-mt-6 lg:-mt-7">
        <div className="mx-auto w-full max-w-[1240px]">
          <BusinessProfileView
            business={previewBusiness}
            services={services}
            mode="dashboard-preview"
            isEditing={isEditing}
            onToggleEditing={() => setIsEditing((current) => !current)}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
