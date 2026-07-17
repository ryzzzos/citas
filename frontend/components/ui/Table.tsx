import React, { ReactNode } from "react";
import AppIcon from "@/components/ui/AppIcon";
import { LucideIcon } from "lucide-react";

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  accessor: (item: T, index: number) => ReactNode;
  className?: string; // Optional class for the cell wrapper
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  gridColsClass: string; // e.g. "grid-cols-[1.2fr_2fr_1.8fr_1.8fr_1.2fr]" or "grid-cols-4"
  keyExtractor: (item: T) => string | number;
  emptyStateMessage?: string;
  emptyStateIcon?: LucideIcon;
  showActions?: boolean; // If true, an Actions column header is added.
  renderActions?: (item: T) => ReactNode; // Must be provided if showActions is true
  containerClassName?: string; // Additional classes for the outermost wrapper
  innerContainerClassName?: string; // Classes for the inner surface containing the rows
  minWidthClass?: string; // e.g. "min-w-[700px]", default is "min-w-0"
}

export function Table<T>({
  data,
  columns,
  gridColsClass,
  keyExtractor,
  emptyStateMessage = "No hay datos para mostrar.",
  emptyStateIcon,
  showActions = false,
  renderActions,
  containerClassName = "flex-1 min-h-0 flex flex-col",
  innerContainerClassName = "overflow-hidden",
  minWidthClass = "min-w-0",
}: TableProps<T>) {
  return (
    <div className={containerClassName}>
      {/* First Surface (darker white container: bg-[var(--surface-2)] with border, rounded corners, and shadow. No overflow to prevent shadow clipping) */}
      <div className="flex-1 min-h-0 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-1 shadow-[var(--shadow-sm)] flex flex-col">
        
        {/* Scrollable wrapper inside the card */}
        <div className="flex-1 min-h-0 overflow-x-auto scrollbar-thin flex flex-col">
          
          {/* Inner content wrapper that enforces min-width */}
          <div className={`flex-1 min-h-0 ${minWidthClass} flex flex-col`}>
            
            {/* Header Row */}
            <div className={`grid ${gridColsClass} items-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-5 pb-2 pt-2 select-none shrink-0`}>
              {columns.map((col, idx) => {
                // By default, left align everything except the last column if there are no actions.
                const isLast = idx === columns.length - 1;
                const alignmentClass = isLast && !showActions ? "pr-2 text-right" : "pl-2";
                return (
                  <div key={col.id} className={col.className || alignmentClass}>
                    {col.header}
                  </div>
                );
              })}
              {showActions && (
                <div className="text-right pr-2">Acciones</div>
              )}
            </div>

            {/* Second Surface (whiter/lighter container: bg-[var(--surface-3)] with its own border and rounded corners) */}
            <div className={`flex-1 min-h-0 rounded-[var(--radius-lg)] border border-[var(--border-strong)]/60 bg-[var(--surface-3)] divide-y divide-[var(--border-strong)]/45 shadow-sm flex flex-col ${innerContainerClassName}`}>
              {data.length === 0 ? (
                <div className="py-8 text-center text-[var(--text-muted)] font-medium bg-[var(--surface-3)]">
                  {emptyStateIcon && (
                    <AppIcon icon={emptyStateIcon} className="mx-auto mb-2 text-[var(--text-muted)] opacity-50" />
                  )}
                  {emptyStateMessage}
                </div>
              ) : (
                data.map((item, index) => (
                  <div key={keyExtractor(item)} className={`grid ${gridColsClass} items-center px-4 py-4 hover:bg-[var(--surface-2)]/60 transition-colors bg-[var(--surface-3)]`}>
                    {columns.map((col, idx) => {
                      const isLast = idx === columns.length - 1;
                      const alignmentClass = isLast && !showActions ? "pr-2 text-right" : "pl-2";
                      return (
                        <div key={col.id} className={col.className || alignmentClass}>
                          {col.accessor(item, index)}
                        </div>
                      );
                    })}
                    {showActions && renderActions && (
                      <div className="pr-2 text-right">
                        {renderActions(item)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
