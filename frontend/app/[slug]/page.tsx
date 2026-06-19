"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import BusinessProfileView from "@/components/business-profile/BusinessProfileView";
import StickyBranchSelector from "@/components/public-profile/StickyBranchSelector";
import LocationPickerDrawer from "@/components/public-profile/LocationPickerDrawer";
import Button from "@/components/ui/Button";
import { createBooking, getAvailability, getBusinessBySlug, listServices, listStaff, getServiceCategories } from "@/lib/api";
import { listBranches } from "@/lib/api/branches";
import ServiceBookingDrawer from "@/components/public-profile/ServiceBookingDrawer";
import type { Business, Service, Staff, ServiceCategory, Branch } from "@/types";

export default function PublicBusinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [business, setBusiness] = useState<Business | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [shakeBadge, setShakeBadge] = useState(false);

  // Booking Drawer State
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);

  const selectedBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedBranchId) || undefined;
  }, [branches, selectedBranchId]);

  const displayServices = useMemo(() => {
    if (!selectedBranchId) return services;
    
    // Find staff that belongs to the selected branch
    const branchStaff = staff.filter((s) => s.branch_id === selectedBranchId);
    
    // Extract unique service IDs that these staff members provide
    const branchServiceIds = new Set<string>();
    branchStaff.forEach((member) => {
      member.service_ids?.forEach((id) => branchServiceIds.add(id));
    });
    
    // Filter the global services list to only those provided at this branch
    return services.filter((service) => branchServiceIds.has(service.id));
  }, [services, staff, selectedBranchId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const biz = await getBusinessBySlug(slug);
        const [brs, svcs, cats, sf] = await Promise.all([
          listBranches(biz.id),
          listServices(biz.id, { includeInactive: false }),
          getServiceCategories(biz.id),
          listStaff(biz.id),
        ]);

        setBusiness(biz);
        setBranches(brs.filter(b => b.is_active));
        setServices(svcs);
        setCategories(cats);
        setStaff(sf);
      } catch {
        setBusiness(null);
        setBranches([]);
        setServices([]);
        setCategories([]);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  useEffect(() => {
    const branchFromQuery = searchParams.get("branch");
    if (branchFromQuery && branches.some((b) => b.id === branchFromQuery)) {
      setSelectedBranchId(branchFromQuery);
    }
  }, [searchParams, branches]);

  useEffect(() => {
    const serviceFromQuery = searchParams.get("service");
    if (!serviceFromQuery) {
      return;
    }

    const service = services.find((service) => service.id === serviceFromQuery);
    if (service) {
      setSelectedServiceForBooking(service);
      if (branches.length === 0 || selectedBranchId) {
        setIsBookingDrawerOpen(true);
      }
    }
  }, [searchParams, services, branches, selectedBranchId]);

  function handleServiceSelect(serviceId: string) {
    if (branches.length > 0 && !selectedBranchId) {
      setShakeBadge(true);
      setTimeout(() => {
        setShakeBadge(false);
        setIsLocationDrawerOpen(true);
      }, 600);
      return;
    }
    
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setSelectedServiceForBooking(service);
      setIsBookingDrawerOpen(true);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)] dark:border-[var(--border-strong)] dark:border-t-[var(--app-primary)]" />
      </div>
    );
  }

  if (!business) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Negocio no encontrado</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Revisa el enlace o explora otras opciones en el mapa de sucursales.
        </p>
        <Link
          href="/sucursales"
          className="dashboard-focusable mt-5 inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] px-4 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:hover:bg-[var(--surface-2)]"
        >
          Ir a sucursales
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:py-10">
      <StickyBranchSelector 
        branches={branches}
        selectedBranchId={selectedBranchId}
        onClick={() => setIsLocationDrawerOpen(true)}
        pulse={shakeBadge}
      />

      <BusinessProfileView 
        business={business} 
        services={displayServices} 
        categories={categories} 
        branch={selectedBranch} 
        mode="public" 
        onServiceSelect={handleServiceSelect} 
      />

      {business && branches.length > 0 && (
        <LocationPickerDrawer
          open={isLocationDrawerOpen}
          onClose={() => setIsLocationDrawerOpen(false)}
          branches={branches}
          selectedBranchId={selectedBranchId}
          onSelect={(id) => {
            setSelectedBranchId(id);
          }}
        />
      )}

      {business && (
        <ServiceBookingDrawer
          open={isBookingDrawerOpen}
          onClose={() => setIsBookingDrawerOpen(false)}
          business={business}
          service={selectedServiceForBooking}
          branch={selectedBranch || null}
          staffList={staff}
        />
      )}
    </main>
  );
}
