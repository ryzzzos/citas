"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getMe, getMyBusiness, logout } from "@/lib/api";

const ONBOARDING_PATH = "/onboarding/business";
const LOGIN_PATH = "/auth/login";

function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/auth");
}

function isOnboardingRoute(pathname: string): boolean {
  return pathname === ONBOARDING_PATH;
}

function isAuthError(detail: string): boolean {
  return detail === "Invalid or expired token" || detail === "User not found";
}

export default function SessionOnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function enforceFlow(): Promise<void> {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) return;

      const onAuth = isAuthRoute(pathname);
      const onOnboarding = isOnboardingRoute(pathname);

      try {
        const me = await getMe();
        if (!active) return;

        if (me.role === "customer" || me.role === "admin") {
          if (onOnboarding) {
            router.replace("/dashboard");
          }
          return;
        }

        if (me.role !== "business_owner") {
          return;
        }

        try {
          await getMyBusiness();
          if (!active) return;

          if (onOnboarding) {
            router.replace("/dashboard/agenda");
          }
        } catch (error) {
          if (!active) return;

          const detail = error instanceof Error ? error.message : "";
          if (detail === "Business profile not created") {
            if (!onOnboarding && !onAuth) {
              router.replace(ONBOARDING_PATH);
            }
            return;
          }

          if (isAuthError(detail)) {
            logout();
            if (!onAuth) {
              router.replace(LOGIN_PATH);
            }
          }
        }
      } catch (error) {
        if (!active) return;
        const detail = error instanceof Error ? error.message : "";

        if (isAuthError(detail)) {
          logout();
          if (!onAuth) {
            router.replace(LOGIN_PATH);
          }
        }
      }
    }

    enforceFlow();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  return null;
}
