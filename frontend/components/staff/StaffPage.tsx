"use client";

import { useState } from "react";
import { sileo } from "sileo";
import Button from "@/components/ui/Button";
import { useStaff } from "@/lib/staff/useStaff";
import type { Staff } from "@/types";
import StaffFormModal from "./StaffFormModal";
import StaffScheduleModal from "./StaffScheduleModal";
import Image from "next/image";
import { useBranchContext } from "@/contexts/BranchContext";
import AppIcon from "@/components/ui/AppIcon";
import { Users, Mail, Phone, Edit2, Trash2, CalendarClock } from "lucide-react";

export default function StaffPage() {
  const { staff, loading, error, reload, remove, saving } = useStaff();
  const { activeBranch } = useBranchContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
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

  function openScheduleModal(member: Staff) {
    setActionError(null);
    setEditingStaff(member);
    setScheduleModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingStaff(null);
    setActionError(null);
  }

  function closeScheduleModal() {
    setScheduleModalOpen(false);
    setEditingStaff(null);
    setActionError(null);
  }

  async function handleDelete(member: Staff) {
    const confirmed = window.confirm(
      `¿Eliminar a ${member.name}? Perderá el acceso y se cancelarán sus reservas futuras asociadas.`
    );
    if (!confirmed) return;

    setActionError(null);
    const promise = remove(member.id);
    sileo.promise(promise, {
      loading: { title: "Eliminando empleado..." },
      success: { 
        title: "Empleado eliminado",
        description: `"${member.name}" fue eliminado con éxito.`
      },
      error: (err) => ({ 
        title: "Error al eliminar empleado", 
        description: err instanceof Error ? err.message : "Inténtalo de nuevo." 
      }),
    });
    try {
      await promise;
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
        <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
          {staff.map((member) => (
            <article
              key={member.id}
              className={`group flex flex-col sm:flex-row overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] ${!member.is_active ? 'opacity-75 grayscale-[0.5]' : ''}`}
            >
              {/* Avatar/Photo Section */}
              <div className="relative h-48 w-full sm:h-auto sm:w-40 sm:shrink-0 bg-[var(--surface-1)] border-b sm:border-b-0 sm:border-r border-[var(--border-strong)] overflow-hidden">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-2)]">
                    <span className="text-4xl font-bold text-[var(--text-muted)]/40">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute left-3 top-3 z-10 flex flex-col items-start">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-md ${
                    member.is_active 
                      ? "border-white/20 bg-white/30 dark:bg-black/30 text-[var(--color-info)] dark:text-[var(--color-info)]"
                      : "border-[var(--border-strong)]/50 bg-[var(--surface-1)]/50 text-[var(--text-secondary)]"
                  }`}>
                    {member.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-1 flex-col p-4 sm:p-5 min-w-0 justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[17px] font-bold tracking-tight text-[var(--text-primary)] truncate">
                      {member.name}
                    </h3>
                    <span className="shrink-0 inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      {member.service_ids?.length || 0} Servicios
                    </span>
                  </div>
                  
                  <div className="mt-3 flex flex-col gap-2 text-[13px] text-[var(--text-secondary)]">
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <AppIcon icon={Mail} size="xs" className="shrink-0 text-[var(--text-muted)]" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <AppIcon icon={Phone} size="xs" className="shrink-0 text-[var(--text-muted)]" />
                        <span className="truncate">{member.phone}</span>
                      </div>
                    )}
                    {!member.email && !member.phone && (
                      <p className="text-[var(--text-muted)] italic">Sin datos de contacto</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-soft)] mt-auto">
                  <button
                    onClick={() => openScheduleModal(member)}
                    className="group/btn flex h-9 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--app-primary)]/10 hover:text-[var(--app-primary)] transition-colors"
                  >
                    <AppIcon icon={CalendarClock} size="xs" className="group-hover/btn:text-[var(--app-primary)] transition-colors" />
                    <span>Horarios</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(member)}
                      className="group/edit flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--color-info)]/10 hover:text-[var(--color-info)] transition-colors"
                      title="Editar Perfil"
                    >
                      <AppIcon icon={Edit2} size="xs" className="group-hover/edit:text-[var(--color-info)] transition-colors" />
                    </button>
                    <button
                      onClick={() => handleDelete(member)}
                      className="group/del flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-colors"
                      title="Eliminar Empleado"
                    >
                      <AppIcon icon={Trash2} size="xs" className="group-hover/del:text-[var(--color-error)] transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
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
      
      <StaffScheduleModal
        open={scheduleModalOpen}
        staff={editingStaff}
        onClose={closeScheduleModal}
      />
    </div>
  );
}
