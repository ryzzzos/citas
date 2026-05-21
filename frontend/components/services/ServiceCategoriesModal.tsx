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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--surface-0)]/60 backdrop-blur-md p-4 sm:p-6 transition-all duration-300">
      <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-[24px] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-2xl max-h-[90vh]">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-3)]/90 px-6 py-5 backdrop-blur-md">
          <div>
            <h3 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">Categorías</h3>
            <p className="text-[13.5px] text-[var(--text-secondary)] mt-0.5">
              Organiza tus servicios para facilitar la búsqueda.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)] transition-colors hover:bg-[var(--border-strong)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Add Form */}
          <form onSubmit={handleCreate} className="relative">
            <input 
              id="new-cat"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Tratamientos faciales..."
              className="w-full h-12 pl-4 pr-24 rounded-xl bg-[var(--surface-3)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-1 focus:ring-[var(--app-primary)] transition-all shadow-[var(--shadow-sm)]"
            />
            <button 
              type="submit" 
              disabled={!newName.trim()} 
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[var(--text-primary)] text-[var(--surface-1)] text-[13px] font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              Añadir
            </button>
          </form>

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)]">
                <p className="text-[14px] font-semibold text-[var(--text-primary)]">Sin categorías</p>
                <p className="text-[13px] text-[var(--text-muted)] mt-1">Crea tu primera categoría arriba.</p>
              </div>
            ) : (
              categories.map((cat, idx) => (
                <div 
                  key={cat.id} 
                  className="group flex flex-col rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-3 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                >
                  {editingId === cat.id ? (
                     <form onSubmit={(e) => handleUpdate(e, cat)} className="flex items-center gap-2">
                       <input 
                          autoFocus
                          id={`edit-${cat.id}`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 h-10 px-3 rounded-lg bg-[var(--surface-1)] border border-[var(--app-primary)] text-[14px] text-[var(--text-primary)] focus:outline-none"
                        />
                        <button type="button" onClick={() => setEditingId(null)} className="px-3 h-10 rounded-lg text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)]">
                          Cancelar
                        </button>
                        <button type="submit" disabled={!editName.trim()} className="px-3 h-10 rounded-lg bg-[var(--app-primary)] text-white text-[13px] font-semibold disabled:opacity-50">
                          Guardar
                        </button>
                     </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col opacity-30 transition-opacity group-hover:opacity-100">
                          <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} className="p-0.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-0" aria-label="Subir">▲</button>
                          <button type="button" onClick={() => moveDown(idx)} disabled={idx === categories.length - 1} className="p-0.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-0" aria-label="Bajar">▼</button>
                        </div>
                        <span className="text-[14.5px] font-semibold tracking-tight text-[var(--text-primary)]">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <button 
                          onClick={() => startEdit(cat)} 
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--app-primary)] transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} strokeWidth={2.5} />
                        </button>
                        {cat.name !== "Sin categoría" && (
                          <button 
                            onClick={() => remove(cat.id)} 
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--color-error)] transition-colors"
                            title="Eliminar"
                          >
                            <Trash size={14} strokeWidth={2.5} />
                          </button>
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
    </div>
  );
}
