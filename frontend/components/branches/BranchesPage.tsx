"use client";

import { useState } from "react";
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
    try {
      if (editingBranch) {
        await updateBranch(business.id, editingBranch.id, data as UpdateBranchInput);
      } else {
        await createBranch(business.id, data as CreateBranchInput);
      }
      await refreshBranches();
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
    try {
      await deleteBranch(business.id, branch.id);
      await refreshBranches();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar la sucursal.");
    }
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Mis Sedes</h2>
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
        <section className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-3)] p-12 text-center shadow-[var(--shadow-sm)]">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--app-primary)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-2)] text-[var(--app-primary)]">
                    <AppIcon icon={Store} size="sm" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{branch.name}</h3>
                </div>
                {!branch.is_active && (
                  <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Inactiva
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4 p-4 text-sm text-[var(--text-secondary)]">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <AppIcon icon={MapPin} size="xs" className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                    <span>{branch.address}, {branch.city}</span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <AppIcon icon={Phone} size="xs" className="shrink-0 text-[var(--text-muted)]" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-soft)]">
                  <button
                    onClick={() => openEditModal(branch)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Editar"
                  >
                    <AppIcon icon={Edit2} size="xs" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-colors"
                    aria-label="Eliminar"
                  >
                    <AppIcon icon={Trash2} size="xs" />
                  </button>
                </div>
              </div>
            </div>
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
