"use client";

import { useMemo, useState } from "react";

import ServiceFormModal from "@/components/services/ServiceFormModal";
import ServiceCategoriesModal from "@/components/services/ServiceCategoriesModal";
import ServicesFilters from "@/components/services/ServicesFilters";
import ServicesHeader from "@/components/services/ServicesHeader";
import ServicesList from "@/components/services/ServicesList";
import Button from "@/components/ui/Button";
import { useServices } from "@/lib/services/useServices";
import type { CreateServiceInput, Service } from "@/types";

export default function ServicesPage() {
  const {
    services,
    filteredServices,
    filters,
    setFilters,
    loading,
    error,
    saving,
    reload,
    create,
    update,
    remove,
    toggle,
    uploadImage,
  } = useServices();

  const [modalOpen, setModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const mode = useMemo(() => (editingService ? "edit" : "create"), [editingService]);

  function openCreateModal() {
    setActionError(null);
    setEditingService(null);
    setModalOpen(true);
  }

  function openEditModal(service: Service) {
    setActionError(null);
    setEditingService(service);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingService(null);
    setActionError(null);
  }

  async function handleSubmit(data: CreateServiceInput) {
    try {
      if (editingService) {
        await update(editingService.id, data);
      } else {
        await create(data);
      }
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo guardar el servicio.");
    }
  }

  async function handleToggle(service: Service) {
    setActionError(null);
    try {
      await toggle(service.id, !service.is_active);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo cambiar el estado.");
    }
  }

  async function handleDelete(service: Service) {
    const confirmed = window.confirm(
      `Se eliminara el servicio \"${service.name}\". Esta accion no se puede deshacer.`
    );
    if (!confirmed) {
      return;
    }

    setActionError(null);
    try {
      await remove(service.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar el servicio.");
    }
  }

  if (loading) {
    return (
      <div className="dashboard-surface-1 flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)] dark:border-[var(--border-strong)] dark:border-t-[var(--app-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <section className="bg-[var(--surface-1)] flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="dashboard-title text-lg font-semibold">No se pudieron cargar tus servicios</p>
        <p className="dashboard-text-secondary max-w-lg text-sm">{error}</p>
        <Button onClick={reload}>Reintentar</Button>
      </section>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <ServicesHeader 
        services={services} 
        onCreate={openCreateModal} 
        onManageCategories={() => setCategoriesModalOpen(true)}
      />

      <ServicesFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {actionError ? (
        <p className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
          {actionError}
        </p>
      ) : null}

      {filteredServices.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-3)] p-12 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">No hay servicios para este filtro</p>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Ajusta la búsqueda o crea un nuevo servicio para comenzar.
          </p>
          <Button onClick={openCreateModal} className="mt-6 shadow-[var(--shadow-sm)] border border-[var(--border-soft)]">
            Crear servicio
          </Button>
        </section>
      ) : (
        <ServicesList
          services={filteredServices}
          disabled={saving}
          viewMode={viewMode}
          onEdit={openEditModal}
          onToggleActive={handleToggle}
          onDelete={handleDelete}
        />
      )}

      <ServiceFormModal
        open={modalOpen}
        mode={mode}
        service={editingService}
        saving={saving}
        error={actionError}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onUploadImage={uploadImage}
      />

      <ServiceCategoriesModal 
        open={categoriesModalOpen} 
        onClose={() => { setCategoriesModalOpen(false); reload(); }} 
      />
    </div>
  );
}
