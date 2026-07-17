"use client";

import { useState } from "react";
import { sileo } from "sileo";
import { useBranchContext } from "@/contexts/BranchContext";
import Button from "@/components/ui/Button";
import BranchFormModal from "./BranchFormModal";
import type { Branch, CreateBranchInput, UpdateBranchInput } from "@/types";
import { createBranch, updateBranch, deleteBranch } from "@/lib/api";
import { Store, MapPin, Phone, MoreVertical, Edit2, Trash2 } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";

export default function BranchesPage() {
  const { branches, business, isLoading, error, refreshBranches } = useBranchContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <section className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-semibold text-[var(--text-primary)]">No se pudieron cargar tus sucursales</p>
        <p className="max-w-lg text-sm text-[var(--text-muted)]">{error}</p>
        <Button onClick={refreshBranches}>Reintentar</Button>
      </section>
    );
  }

  function openCreateModal() {
    setActionError(null);
    setEditingBranch(null);
    setModalOpen(true);
  }

  function openEditModal(branch: Branch) {
    setActionError(null);
    setEditingBranch(branch);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingBranch(null);
    setActionError(null);
  }

  async function handleSubmit(data: CreateBranchInput | UpdateBranchInput) {
    if (!business) return;
    setSaving(true);
    setActionError(null);

    const isEdit = !!editingBranch;
    const promise = (async () => {
      if (editingBranch) {
        await updateBranch(business.id, editingBranch.id, data as UpdateBranchInput);
      } else {
        await createBranch(business.id, data as CreateBranchInput);
      }
      await refreshBranches();
    })();

    sileo.promise(promise, {
      loading: { title: isEdit ? "Guardando sucursal..." : "Creando sucursal..." },
      success: { 
        title: isEdit ? "Sucursal guardada" : "Sucursal creada",
        description: `"${data.name}" se guardó con éxito.`
      },
      error: (err) => ({ 
        title: "Error al guardar sucursal", 
        description: err instanceof Error ? err.message : "Inténtalo de nuevo." 
      }),
    });

    try {
      await promise;
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al guardar la sucursal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(branch: Branch) {
    if (!business) return;
    const confirmed = window.confirm(
      `¿Eliminar la sucursal "${branch.name}"? Esta acción no se puede deshacer y podría afectar reservas y empleados asignados a ella.`
    );
    if (!confirmed) return;

    setActionError(null);
    const promise = (async () => {
      await deleteBranch(business.id, branch.id);
      await refreshBranches();
    })();

    sileo.promise(promise, {
      loading: { title: "Eliminando sucursal..." },
      success: { 
        title: "Sucursal eliminada",
        description: `"${branch.name}" fue eliminada del sistema.`
      },
      error: (err) => ({ 
        title: "Error al eliminar sucursal", 
        description: err instanceof Error ? err.message : "Inténtalo de nuevo." 
      }),
    });

    try {
      await promise;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar la sucursal.");
    }
  }

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            Administra las ubicaciones físicas de tu negocio.
          </p>
        </div>
        <Button onClick={openCreateModal} className="shrink-0 shadow-[var(--shadow-sm)]">
          Crear nueva sede
        </Button>
      </div>

      {actionError && (
        <p className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
          {actionError}
        </p>
      )}

      {branches.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-3)] p-10 text-center shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)]">
            <AppIcon icon={Store} size="lg" />
          </div>
          <p className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">No hay sucursales</p>
          <p className="mt-1 max-w-sm text-[14px] text-[var(--text-muted)]">
            Agrega tu primera sucursal para poder recibir reservas de clientes y asignar empleados.
          </p>
          <Button onClick={openCreateModal} className="mt-6 shadow-[var(--shadow-sm)] border border-[var(--border-soft)]">
            Crear sucursal
          </Button>
        </section>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {branches.map((branch) => (
            <article
              key={branch.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-gradient-to-br from-[var(--surface-3)] to-[var(--surface-2)] p-4 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--border-soft)] ${!branch.is_active ? 'opacity-75 grayscale-[0.3]' : ''}`}
            >
              {/* Inner subtle glow for depth */}
              <div className="pointer-events-none absolute inset-0 rounded-[var(--radius-2xl)] ring-1 ring-inset ring-white/5 dark:ring-white/10" />

              {/* Top Row: Icon & Badge */}
              <div className="relative flex items-start justify-between">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--app-primary)]/10 text-[var(--app-primary)] shadow-inner backdrop-blur-md">
                  <AppIcon icon={Store} size="sm" />
                </div>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-[0_2px_8px_rgba(0,0,0,0.05)] backdrop-blur-md ${
                  branch.is_active 
                    ? "border-[var(--color-info)]/20 bg-[var(--color-info)]/10 dark:bg-white/10 text-[var(--color-info)] dark:text-[var(--color-info)]"
                    : "border-[var(--border-strong)]/50 bg-[var(--surface-1)]/50 text-[var(--text-secondary)]"
                }`}>
                  {branch.is_active ? "Activa" : "Inactiva"}
                </span>
              </div>

              {/* Middle: Info */}
              <div className="relative mt-5 mb-4">
                <h3 className="text-[16px] font-bold tracking-tight text-[var(--text-primary)] leading-tight line-clamp-1">
                  {branch.name}
                </h3>
                <div className="mt-2.5 flex flex-col gap-1.5 text-[12.5px] text-[var(--text-secondary)]">
                  <div className="flex items-start gap-2">
                    <AppIcon icon={MapPin} size="xs" className="mt-[2px] shrink-0 text-[var(--text-muted)]" />
                    <span className="line-clamp-1">{branch.address}, {branch.city}</span>
                  </div>
                  {branch.phone ? (
                    <div className="flex items-center gap-2">
                      <AppIcon icon={Phone} size="xs" className="shrink-0 text-[var(--text-muted)]" />
                      <span className="truncate">{branch.phone}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AppIcon icon={Phone} size="xs" className="shrink-0 opacity-0" />
                      <span className="text-[var(--text-muted)] italic text-[11px]">Sin teléfono</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Actions Bar */}
              <div className="relative mt-auto flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-strong)]/50">
                <button
                  onClick={() => openEditModal(branch)}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-[var(--surface-1)]/80 px-3 text-[11.5px] font-semibold text-[var(--text-secondary)] backdrop-blur-md transition-colors hover:bg-[var(--color-info)]/10 hover:text-[var(--color-info)]"
                >
                  <AppIcon icon={Edit2} size="xs" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(branch)}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-[var(--surface-1)]/80 px-3 text-[11.5px] font-semibold text-[var(--text-secondary)] backdrop-blur-md transition-colors hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                >
                  <AppIcon icon={Trash2} size="xs" />
                  <span>Eliminar</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <BranchFormModal
        open={modalOpen}
        mode={editingBranch ? "edit" : "create"}
        branch={editingBranch}
        saving={saving}
        error={actionError}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
