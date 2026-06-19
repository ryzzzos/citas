"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMyBusiness, listBranches } from "@/lib/api";
import type { Branch, Business } from "@/types";

interface BranchContextValue {
  branches: Branch[];
  activeBranch: Branch | null;
  isLoading: boolean;
  error: string | null;
  business: Business | null;
  setActiveBranch: (branchId: string) => void;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextValue | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);

  const fetchBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the business first to get its ID
      const myBusiness = await getMyBusiness();
      setBusiness(myBusiness);
      
      // Then get its branches
      const fetchedBranches = await listBranches(myBusiness.id, { includeInactive: true });
      setBranches(fetchedBranches);
      
      // Determine active branch
      if (fetchedBranches.length > 0) {
        // Try to restore from local storage
        const savedBranchId = localStorage.getItem("active_branch_id");
        if (savedBranchId) {
          const found = fetchedBranches.find(b => b.id === savedBranchId);
          if (found) {
            setActiveBranchState(found);
            return;
          }
        }
        
        // Default to the first active branch or just the first branch
        const defaultBranch = fetchedBranches.find(b => b.is_active) || fetchedBranches[0];
        setActiveBranchState(defaultBranch);
        localStorage.setItem("active_branch_id", defaultBranch.id);
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
      setError("No se pudieron cargar las sucursales");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const setActiveBranch = useCallback((branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setActiveBranchState(branch);
      localStorage.setItem("active_branch_id", branch.id);
    }
  }, [branches]);

  return (
    <BranchContext.Provider
      value={{
        branches,
        activeBranch,
        isLoading,
        error,
        business,
        setActiveBranch,
        refreshBranches: fetchBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranchContext() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranchContext must be used within a BranchProvider");
  }
  return context;
}
