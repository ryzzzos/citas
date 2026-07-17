"use client";

import { useMemo, useState, useEffect } from "react";
import { sileo } from "sileo";

import ServiceFormModal from "@/components/services/ServiceFormModal";
import ServiceCategoriesModal from "@/components/services/ServiceCategoriesModal";
import ServicesFilters from "@/components/services/ServicesFilters";
import ServicesHeader from "@/components/services/ServicesHeader";
import ServicesList from "@/components/services/ServicesList";
import Button from "@/components/ui/Button";
import { useServices } from "@/lib/services/useServices";
import { useServiceCategories } from "@/lib/services/useServiceCategories";
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

  const {
    categories,
    loading: categoriesLoading,
    reload: reloadCategories,
  } = useServiceCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const mode = useMemo(() => (editingService ? "edit" : "create"), [editingService]);

  const [hasLoaded, setHasLoaded] = useState(false);

  if (!loading && !hasLoaded) {
    setHasLoaded(true);
  }

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
    const promise = editingService 
      ? update(editingService.id, data)
      : create(data);

    sileo.promise(promise, {
      loading: { 
        title: editingService ? "Guardando cambios..." : "Creando servicio..." 
      },
      success: { 
        title: editingService ? "Servicio guardado" : "Servicio creado con éxito",
        description: `El servicio "${data.name}" se guardó correctamente.`
      },
      error: (err) => ({ 
        title: "Error al guardar servicio", 
        description: err instanceof Error ? err.message : "Inténtalo de nuevo." 
      }),
    });

    try {
      await promise;
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo guardar el servicio.");
    }
  }

  async function handleToggle(service: Service) {
    setActionError(null);
    const action = !service.is_active ? "Activando" : "Desactivando";
    const actionSuccess = !service.is_active ? "activado" : "desactivado";
    const promise = toggle(service.id, !service.is_active);

    sileo.promise(promise, {
      loading: { title: `${action} servicio...` },
      success: { 
        title: `Servicio ${actionSuccess}`,
        description: `"${service.name}" ha sido ${actionSuccess}.`
      },
      error: (err) => ({ 
        title: "Error al cambiar estado", 
        description: err instanceof Error ? err.message : "Inténtalo de nuevo." 
      }),
    });

    try {
      await promise;
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
    const promise = remove(service.id);

    sileo.promise(promise, {
      loading: { title: "Eliminando servicio..." },
      success: { 
        title: "Servicio eliminado",
        description: `"${service.name}" se eliminó del catálogo.`
      },
      error: (err) => ({ 
        title: "Error al eliminar servicio", 
        description: err instanceof Error ? err.message : "Inténtalo de nuevo." 
      }),
    });

    try {
      await promise;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar el servicio.");
    }
  }

  if (loading && !hasLoaded) {
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
    <div className="flex flex-col min-h-full overflow-hidden space-y-3 lg:space-y-4">
      <div className="shrink-0 space-y-3 lg:space-y-4">
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
        categories={categories}
      />
      </div>

      <div className="flex-1 overflow-y-auto pb-10 pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border-strong)]">
        {actionError ? (
        <p className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
          {actionError}
        </p>
      ) : null}

      {filteredServices.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-3)] p-10 text-center shadow-[var(--shadow-sm)]">
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
          categories={categories}
        />
      )}
      </div>

      <ServiceFormModal
        open={modalOpen}
        mode={mode}
        service={editingService}
        saving={saving}
        error={actionError}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onUploadImage={uploadImage}
      />

      <ServiceCategoriesModal 
        open={categoriesModalOpen} 
        onClose={() => { 
          setCategoriesModalOpen(false); 
          reload(); 
          reloadCategories(); 
        }} 
      />
    </div>
  );
}
