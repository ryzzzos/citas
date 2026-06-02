"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useStaff } from "@/lib/staff/useStaff";
import type { Staff } from "@/types";
import StaffFormModal from "./StaffFormModal";
import { useBranchContext } from "@/contexts/BranchContext";
import AppIcon from "@/components/ui/AppIcon";
import { Users, Mail, Phone, Edit2, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";

export default function StaffPage() {
  const { staff, loading, error, reload, remove, saving } = useStaff();
  const { activeBranch } = useBranchContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-semibold text-[var(--text-primary)]">No se pudieron cargar los empleados</p>
        <p className="max-w-lg text-sm text-[var(--text-muted)]">{error}</p>
        <Button onClick={reload}>Reintentar</Button>
      </section>
    );
  }

  if (!activeBranch) {
    return (
      <section className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-semibold text-[var(--text-primary)]">Selecciona una sucursal</p>
        <p className="max-w-lg text-sm text-[var(--text-muted)]">
          Debes seleccionar o crear una sucursal para administrar su personal.
        </p>
      </section>
    );
  }

  function openCreateModal() {
    setActionError(null);
    setEditingStaff(null);
    setModalOpen(true);
  }

  function openEditModal(member: Staff) {
    setActionError(null);
    setEditingStaff(member);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingStaff(null);
    setActionError(null);
  }

  async function handleDelete(member: Staff) {
    const confirmed = window.confirm(
      `¿Eliminar a ${member.name}? Perderá el acceso y se cancelarán sus reservas futuras asociadas.`
    );
    if (!confirmed) return;

    setActionError(null);
    try {
      await remove(member.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar empleado.");
    }
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Mis Empleados</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Personal asignado a <strong className="text-[var(--text-secondary)]">{activeBranch.name}</strong>.
          </p>
        </div>
        <Button onClick={openCreateModal} className="shrink-0 shadow-[var(--shadow-sm)]">
          Agregar empleado
        </Button>
      </div>

      {actionError && (
        <p className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
          {actionError}
        </p>
      )}

      {staff.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-3)] p-12 text-center shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)]">
            <AppIcon icon={Users} size="lg" />
          </div>
          <p className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Sin empleados en esta sede</p>
          <p className="mt-1 max-w-sm text-[14px] text-[var(--text-muted)]">
            Agrega empleados para que puedan recibir reservas para los servicios que ofreces aquí.
          </p>
          <Button onClick={openCreateModal} className="mt-6 shadow-[var(--shadow-sm)] border border-[var(--border-soft)]">
            Agregar empleado
          </Button>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className={`group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--app-primary)] hover:shadow-[var(--shadow-md)] ${!member.is_active ? 'opacity-75 grayscale-[0.5]' : ''}`}
            >
              <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--app-primary)] ring-2 ring-[var(--surface-1)]">
                    <span className="text-sm font-bold">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{member.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {member.is_active ? (
                        <><AppIcon icon={ShieldCheck} size="xs" className="text-[var(--color-success)]" /> Activo</>
                      ) : (
                        <><AppIcon icon={ShieldAlert} size="xs" /> Inactivo</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4 p-4 text-sm text-[var(--text-secondary)]">
                <div className="space-y-2">
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <AppIcon icon={Mail} size="xs" className="shrink-0 text-[var(--text-muted)]" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <AppIcon icon={Phone} size="xs" className="shrink-0 text-[var(--text-muted)]" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full bg-[var(--surface-1)] px-2 py-0.5 text-xs text-[var(--text-secondary)] border border-[var(--border-soft)]">
                      {member.service_ids?.length || 0} servicios asignados
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-soft)]">
                  <button
                    onClick={() => openEditModal(member)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Editar"
                  >
                    <AppIcon icon={Edit2} size="xs" />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
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

      <StaffFormModal
        open={modalOpen}
        mode={editingStaff ? "edit" : "create"}
        staff={editingStaff}
        saving={saving}
        onClose={closeModal}
      />
    </div>
  );
}
