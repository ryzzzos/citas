"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle2, ChevronRight, ImagePlus, Loader2, RefreshCw, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import Button from "@/components/ui/Button";
import BusinessProfileView from "@/components/business-profile/BusinessProfileView";
import { useBusinessProfileEditor } from "@/lib/business-profile/useBusinessProfileEditor";
import { useBranchContext } from "@/contexts/BranchContext";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Elegant, standard Apple-style input
 */
function FieldGroup({
  label,
  id,
  type = "text",
  value,
  onChange,
  disabled,
  required,
  isTextArea = false,
  maxLength,
  hint,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  required?: boolean;
  isTextArea?: boolean;
  maxLength?: number;
  hint?: React.ReactNode;
}) {
  const commonClasses =
    "dashboard-focusable w-full rounded-[1.125rem] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3.5 text-[0.925rem] font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--app-primary)] focus:bg-[var(--surface-1)] dark:bg-[var(--surface-2)] dark:focus:bg-[var(--surface-1)] disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col gap-1.5 focus-within:text-[var(--app-primary-strong)] dark:focus-within:text-[var(--app-primary)]">
      <label
        htmlFor={id}
        className="ml-1 text-[0.8rem] font-semibold tracking-wide text-[var(--text-secondary)] transition-colors"
      >
        {label}
      </label>
      {isTextArea ? (
        <textarea
          id={id}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          rows={3}
          className={cn(commonClasses, "resize-none")}
        />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          className={commonClasses}
        />
      )}
      {hint && (
        <div className="ml-1 mt-0.5 text-[0.75rem] font-medium text-[var(--text-muted)]">
          {hint}
        </div>
      )}
    </div>
  );
}

/**
 * Visual Upload Box for Avatar/Cover
 */
function ImageUploadField({
  label,
  imageUrl,
  uploading,
  onUpload,
  disabled,
  aspectRatio = "aspect-video",
}: {
  label: string;
  imageUrl?: string | null;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  disabled?: boolean;
  aspectRatio?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="ml-1 text-[0.8rem] font-semibold tracking-wide text-[var(--text-secondary)]">
        {label}
      </span>
      <label
        className={cn(
          "dashboard-focusable group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.25rem] border border-[var(--border-strong)] bg-[var(--surface-2)] transition-colors hover:bg-[var(--surface-3)] dark:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-1)]",
          aspectRatio,
          disabled ? "pointer-events-none opacity-60" : ""
        )}
      >
        {imageUrl && !uploading && (
          <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
        )}
        <div
          className={cn(
            "relative z-10 flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-full px-4 py-3 text-center transition-all duration-300",
            imageUrl
              ? "border border-[var(--glass-border)] bg-[var(--surface-glass)] text-[var(--text-primary)] backdrop-blur-md backdrop-saturate-150 group-hover:bg-[var(--surface-glass)]"
              : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
          )}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5" strokeWidth={2.5} />
              <span className="text-[0.75rem] font-bold uppercase tracking-wider">
                {imageUrl ? "Cambiar" : "Elegir"}
              </span>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={onUpload}
          disabled={uploading || disabled}
        />
      </label>
    </div>
  );
}

export default function BusinessProfileEditorPage() {
  const {
    business,
    services,
    categories,
    staff,
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

  const { activeBranch } = useBranchContext();

  const displayServices = useMemo(() => {
    if (!activeBranch) return services;
    
    const branchStaff = staff.filter((s) => s.branch_id === activeBranch.id);
    const branchServiceIds = new Set<string>();
    branchStaff.forEach((member) => {
      member.service_ids?.forEach((id) => branchServiceIds.add(id));
    });
    
    return services.filter((service) => branchServiceIds.has(service.id));
  }, [services, staff, activeBranch]);

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
      setTimeout(() => setIsEditing(false), 1200);
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
      setTimeout(() => setSuccessMessage(""), 3000);
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
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setSuccessMessage("");
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--app-primary)]" />
      </div>
    );
  }

  if (!business || !previewBusiness) {
    return (
      <section className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold text-[var(--text-secondary)]">
          No se pudo cargar el perfil de negocio
        </p>
        <Button onClick={reload} variant="secondary" className="gap-2 rounded-full">
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
      </section>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-transparent">
      {/* MAIN PREVIEW AREA */}
      <div
        className={cn(
          "h-full w-full overflow-y-auto px-4 pb-24 pt-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-6 lg:px-8",
          isEditing && "opacity-60"
        )}
      >
        <div className="mx-auto w-full max-w-[1240px]">
          <BusinessProfileView
            business={previewBusiness}
            services={displayServices}
            categories={categories}
            branch={activeBranch || undefined}
            mode="dashboard-preview"
            isEditing={isEditing}
            onToggleEditing={() => setIsEditing((current) => !current)}
          />
        </div>
      </div>

      {/* OVERLAY AND DRAWER */}
      <AnimatePresence>
        {isEditing && (
          <>
            {/* BACKDROP FOR OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              role="presentation"
              className="fixed inset-0 z-40 bg-[var(--text-primary)]/10 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />

            {/* ELEGANT EDITOR DRAWER */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="pointer-events-auto absolute inset-y-0 right-0 z-50 flex w-[90vw] max-w-[440px] flex-col overflow-hidden rounded-l-[var(--radius-2xl)] border-l border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)] xl:max-w-[480px]"
              aria-hidden={!isEditing}
            >
              {/* DRAWER HEADER */}
              <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="dashboard-focusable inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] active:scale-95"
                    aria-label="Cerrar editor"
                  >
                <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
              </button>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--app-primary)]">
                  Ajustes
                </p>
                <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                  Editar Perfil
                </h2>
              </div>
            </div>
            <Button
              form="business-profile-form"
              type="submit"
              isLoading={saving}
              variant="primary"
              className="h-9 gap-1.5 rounded-full px-4 text-xs shadow-md"
            >
              Guardar
            </Button>
          </header>

          {/* DRAWER BODY */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            <form id="business-profile-form" className="flex flex-col gap-6" onSubmit={onSubmit}>
              
              {/* IMAGES SECTION */}
              <section className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                  Identidad Visual
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ImageUploadField
                    label="Portada"
                    imageUrl={draft.cover_image_url}
                    uploading={uploadingCover}
                    onUpload={onCoverUpload}
                    aspectRatio="aspect-[16/10]"
                  />
                  <ImageUploadField
                    label="Logo"
                    imageUrl={draft.logo_image_url}
                    uploading={uploadingLogo}
                    onUpload={onLogoUpload}
                    aspectRatio="aspect-square sm:aspect-[4/3]"
                  />
                </div>
              </section>

              {/* INFO SECTION */}
              <section className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                  Información Básica
                </h3>
                <FieldGroup
                  id="name"
                  label="Nombre del Negocio"
                  value={draft.name}
                  onChange={(v) => setDraftField("name", v)}
                  required
                />
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup
                    id="category"
                    label="Categoría"
                    value={draft.category}
                    onChange={(v) => setDraftField("category", v)}
                    required
                  />
                  <FieldGroup
                    id="city"
                    label="Ciudad"
                    value={draft.city}
                    onChange={(v) => setDraftField("city", v)}
                    required
                  />
                </div>

                <FieldGroup
                  id="address"
                  label="Dirección Física"
                  value={draft.address}
                  onChange={(v) => setDraftField("address", v)}
                  required
                />
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="slug" className="ml-1 text-[0.8rem] font-semibold tracking-wide text-[var(--text-secondary)]">
                      Slug Público (URL)
                    </label>
                    <button
                      type="button"
                      onClick={suggestSlugFromName}
                      className="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--app-primary)] underline underline-offset-4 hover:brightness-110 active:scale-95"
                    >
                      Autogenerar
                    </button>
                  </div>
                  <div className="flex overflow-hidden rounded-[1.125rem] border border-[var(--border-strong)] bg-[var(--surface-2)] focus-within:border-[var(--app-primary)] focus-within:bg-[var(--surface-1)] dark:bg-[var(--surface-2)] dark:focus-within:bg-[var(--surface-1)] transition-colors">
                    <span className="flex items-center pl-4 pr-1 text-sm font-medium text-[var(--text-muted)]">
                      /
                    </span>
                    <input
                      id="slug"
                      type="text"
                      required
                      value={draft.slug}
                      onChange={(e) => setDraftField("slug", e.target.value.toLowerCase())}
                      className="w-full bg-transparent py-3.5 pr-4 text-[0.925rem] font-medium text-[var(--text-primary)] outline-none"
                    />
                    <div className="flex items-center pr-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={checkSlug}
                        isLoading={checkingSlug}
                        className="h-8 min-w-[70px] rounded-lg px-3 text-xs"
                      >
                        Validar
                      </Button>
                    </div>
                  </div>
                  {slugAvailable === true && (
                    <p className="ml-1 mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--color-success)]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Slug disponible
                    </p>
                  )}
                  {slugAvailable === false && (
                    <p className="ml-1 mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--color-error)]">
                      <X className="h-3.5 w-3.5" /> Slug no disponible o inválido
                    </p>
                  )}
                </div>

                <FieldGroup
                  id="public_bio"
                  label="Biografía (Máx 280 cont.)"
                  value={draft.public_bio}
                  onChange={(v) => setDraftField("public_bio", v)}
                  isTextArea
                  maxLength={280}
                  hint={<span className="font-semibold">{bioCounter}</span>}
                />
              </section>

              {/* CONTACT SECTION */}
              <section className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] mb-6">
                <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                  Contacto
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup
                    id="phone"
                    label="Teléfono"
                    type="tel"
                    value={draft.phone}
                    onChange={(v) => setDraftField("phone", v)}
                    required
                  />
                  <FieldGroup
                    id="whatsapp_phone"
                    label="WhatsApp"
                    type="tel"
                    value={draft.whatsapp_phone}
                    onChange={(v) => setDraftField("whatsapp_phone", v)}
                  />
                </div>
                <FieldGroup
                  id="email"
                  label="Correo Electrónico"
                  type="email"
                  value={draft.email}
                  onChange={(v) => setDraftField("email", v)}
                  required
                />
              </section>
            </form>
          </div>

          {/* STATUS ALERTS */}
          {(error || successMessage) && (
            <div className="mt-auto shrink-0 border-t border-[var(--border-strong)] bg-[var(--surface-1)] p-4">
              {error && (
                <p className="rounded-xl bg-[var(--surface-3)] p-3 text-[0.825rem] font-medium text-[var(--color-error)]">
                  {error}
                </p>
              )}
              {successMessage && (
                <p className="flex items-center gap-2 rounded-xl bg-[var(--surface-3)] p-3 text-[0.825rem] font-medium text-[var(--color-success)]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMessage}
                </p>
              )}
            </div>
          )}
        </motion.aside>
        </>
        )}
      </AnimatePresence>
    </div>
  );
}
