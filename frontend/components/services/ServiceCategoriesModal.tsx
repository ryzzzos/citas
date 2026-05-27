"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useServiceCategories } from "@/lib/services/useServiceCategories";
import { Pencil, Trash, ChevronRight, Power } from "lucide-react";
import type { ServiceCategory } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

interface ServiceCategoriesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ServiceCategoriesModal({ open, onClose }: ServiceCategoriesModalProps) {
  const { categories, loading, saving, create, update, remove } = useServiceCategories();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");

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



  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP FOR OVERLAY */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            role="presentation"
            className="fixed inset-0 z-[90] bg-[var(--text-primary)]/10 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* ELEGANT DRAWER */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-auto fixed right-4 sm:right-6 top-0 bottom-0 my-auto z-[100] flex w-[90vw] max-w-[440px] h-[85vh] flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)] xl:max-w-[480px]"
            aria-hidden={!open}
          >
              {/* DRAWER HEADER */}
              <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="dashboard-focusable inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)] active:scale-95"
                  aria-label="Cerrar modal"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                </button>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--app-primary)]">
                    Catálogo
                  </p>
                  <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                    Categorías
                  </h2>
                </div>
              </div>
            </header>

            {/* DRAWER BODY */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 space-y-6">
              
              {/* Add Form Card */}
              <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                  Añadir nueva categoría
                </h3>
                <form onSubmit={handleCreate} className="relative">
                  <input 
                    id="new-cat"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Tratamientos faciales..."
                    className="dashboard-focusable w-full rounded-[1.125rem] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3.5 pr-24 text-[0.925rem] font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--app-primary)] focus:bg-[var(--surface-1)] dark:bg-[var(--surface-2)] dark:focus:bg-[var(--surface-1)]"
                  />
                  <button 
                    type="submit" 
                    disabled={!newName.trim()} 
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-[0.85rem] bg-[var(--app-primary)] text-white text-[13px] font-semibold transition-transform hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Guardar
                  </button>
                </form>
              </section>

              {/* List Card */}
              <section className="flex flex-col gap-4 mb-6">
                <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] px-1">
                  Categorías existentes
                </h3>
                
                <div className="flex flex-col gap-3">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]">
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">Sin categorías</p>
                      <p className="text-[13px] text-[var(--text-muted)] mt-1">Crea tu primera categoría arriba.</p>
                    </div>
                  ) : (
                    categories.map((cat, idx) => (
                      <div 
                        key={cat.id} 
                        className="group flex flex-col rounded-xl bg-[var(--surface-3)] shadow-[var(--shadow-sm)] border border-[var(--border-strong)] p-4 transition-colors hover:bg-[var(--surface-1)] "
                      >
                        {editingId === cat.id ? (
                           <form onSubmit={(e) => handleUpdate(e, cat)} className="flex items-center gap-2">
                             <input 
                                autoFocus
                                id={`edit-${cat.id}`}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="dashboard-focusable flex-1 h-10 px-3 rounded-[0.85rem] border border-[var(--app-primary)] bg-[var(--surface-2)] text-[14px] font-medium text-[var(--text-primary)] transition-colors focus:bg-[var(--surface-1)] dark:bg-[var(--surface-2)]"
                              />
                              <button type="button" onClick={() => setEditingId(null)} className="px-3 h-10 rounded-[0.85rem] text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)]">
                                Cancelar
                              </button>
                              <button type="submit" disabled={!editName.trim()} className="px-3 h-10 rounded-[0.85rem] bg-[var(--app-primary)] text-white text-[13px] font-semibold disabled:opacity-50">
                                Guardar
                              </button>
                           </form>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-[14.5px] font-semibold tracking-tight text-[var(--text-primary)]">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                type="button"
                                onClick={() => alert("La función de desactivar categoría se implementará en el backend próximamente.")} 
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--color-pending)] transition-colors"
                                title="Desactivar"
                              >
                                <Power size={14} strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={() => startEdit(cat)} 
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--app-primary)] transition-colors"
                                title="Editar"
                              >
                                <Pencil size={14} strokeWidth={2.5} />
                              </button>
                              {cat.name !== "Sin categoría" && (
                                <button 
                                  onClick={() => remove(cat.id)} 
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--color-error)] transition-colors"
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
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
