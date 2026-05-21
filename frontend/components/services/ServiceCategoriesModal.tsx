"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useServiceCategories } from "@/lib/services/useServiceCategories";
import { GripVertical, Pencil, Trash } from "lucide-react";
import type { ServiceCategory } from "@/types";

interface ServiceCategoriesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ServiceCategoriesModal({ open, onClose }: ServiceCategoriesModalProps) {
  const { categories, loading, saving, create, update, remove, reorder } = useServiceCategories();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");

  if (!open) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await create({ name: newName.trim(), position: categories.length });
    setNewName("");
  }

  async function handleUpdate(e: React.FormEvent, cat: ServiceCategory) {
    e.preventDefault();
    if (!editName.trim()) return;
    await update(cat.id, { name: editName.trim() });
    setEditingId(null);
    setEditName("");
  }

  function startEdit(cat: ServiceCategory) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const newItems = [...categories];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    reorder(newItems);
  }

  function moveDown(index: number) {
    if (index === categories.length - 1) return;
    const newItems = [...categories];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    reorder(newItems);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--surface-0)]/50 p-4">
      <div className="dashboard-surface-1 w-full max-w-xl p-5 sm:p-6 flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="dashboard-title text-lg font-semibold">Categorías de Servicios</h3>
            <p className="dashboard-text-secondary mt-1 text-sm">
              Agrupa tus servicios para que tus clientes los encuentren fácilmente. 
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

        <form onSubmit={handleCreate} className="flex gap-2 isolate mb-4">
          <Input 
            id="new-cat"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            label="Nueva Categoría"
            placeholder="Ej. Corte de cabello"
            className="flex-1"
          />
          <Button type="submit" disabled={!newName.trim()} className="mt-7">Añadir</Button>
        </form>

        <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-2">
          {loading ? (
            <p className="text-[var(--text-muted)]">Cargando...</p>
          ) : categories.length === 0 ? (
            <p className="text-[var(--text-muted)]">No tienes categorías aún.</p>
          ) : (
            categories.map((cat, idx) => (
               <div key={cat.id} className="flex flex-col border border-[var(--border-strong)] rounded-xl p-3 bg-[var(--surface-3)] dark:border-[var(--border-strong)]">
                {editingId === cat.id ? (
                   <form onSubmit={(e) => handleUpdate(e, cat)} className="flex gap-2">
                     <Input 
                        id={`edit-${cat.id}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        label="Editar Categoría"
                        className="flex-1"
                      />
                      <div className="flex gap-2 mt-7">
                        <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>Cancelar</Button>
                        <Button type="submit" disabled={!editName.trim()}>Guardar</Button>
                      </div>
                   </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1 text-[var(--text-muted)]">
                        <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} className="hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] disabled:opacity-30">▲</button>
                        <button type="button" onClick={() => moveDown(idx)} disabled={idx === categories.length - 1} className="hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] disabled:opacity-30">▼</button>
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(cat)} className="rounded-lg bg-[var(--surface-2)] p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:bg-[var(--surface-1)] dark:hover:text-[var(--text-primary)]"><Pencil size={16}/></button>
                      {cat.name !== "Sin categoría" && (
                        <button onClick={() => remove(cat.id)} className="rounded-lg p-2 text-[var(--color-error)] hover:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-1)]"><Trash size={16}/></button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
