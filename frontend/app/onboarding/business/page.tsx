"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createBusiness, getMe, getMyBusiness } from "@/lib/api";

interface BusinessOnboardingForm {
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

const EMPTY_FORM: BusinessOnboardingForm = {
  name: "",
  category: "",
  phone: "",
  email: "",
  address: "",
  city: "",
};

export default function BusinessOnboardingPage() {
  const router = useRouter();

  const [form, setForm] = useState<BusinessOnboardingForm>(EMPTY_FORM);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyAccess(): Promise<void> {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      try {
        const me = await getMe();
        if (!active) return;

        if (me.role === "customer") {
          router.replace("/dashboard");
          return;
        }

        if (me.role === "admin") {
          router.replace("/dashboard");
          return;
        }

        try {
          await getMyBusiness();
          if (!active) return;
          router.replace("/dashboard/agenda");
        } catch (onboardingError) {
          if (!active) return;
          const detail = onboardingError instanceof Error ? onboardingError.message : "";
          if (detail !== "Business profile not created") {
            setError(detail || "No se pudo validar el estado de onboarding.");
          }
        }
      } catch (authError) {
        if (!active) return;
        setError(authError instanceof Error ? authError.message : "No se pudo validar la sesión.");
        router.replace("/auth/login");
      } finally {
        if (active) {
          setCheckingAccess(false);
        }
      }
    }

    verifyAccess();

    return () => {
      active = false;
    };
  }, [router]);

  function setField<K extends keyof BusinessOnboardingForm>(field: K, value: BusinessOnboardingForm[K]): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createBusiness({
        name: form.name,
        category: form.category,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
      });
      router.replace("/dashboard/agenda");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo completar el onboarding del negocio."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAccess) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[var(--surface-2)] dark:bg-[var(--surface-0)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)] dark:border-[var(--border-strong)] dark:border-t-[var(--app-primary)]" />
      </div>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[var(--surface-2)] px-4 py-10 dark:bg-[var(--surface-0)]">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-6 shadow-[var(--shadow-lg)] backdrop-blur dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] md:p-8">
        <p className="mb-2 inline-flex items-center rounded-full border border-[var(--color-pending)] bg-[var(--surface-3)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-pending)]">
          Onboarding obligatorio
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
          Completa tu perfil de negocio
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] ">
          Antes de usar agenda y panel de negocio, necesitas crear el perfil principal de tu negocio.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-[var(--text-secondary)] ">Nombre del negocio</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
               className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:focus:border-[var(--app-primary)]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-[var(--text-secondary)] ">Categoría</span>
            <input
              type="text"
              required
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
               className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:focus:border-[var(--app-primary)]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-[var(--text-secondary)] ">Teléfono</span>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
               className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:focus:border-[var(--app-primary)]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-[var(--text-secondary)] ">Correo de negocio</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
               className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:focus:border-[var(--app-primary)]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-[var(--text-secondary)] ">Dirección</span>
            <input
              type="text"
              required
              value={form.address}
              onChange={(event) => setField("address", event.target.value)}
               className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:focus:border-[var(--app-primary)]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-[var(--text-secondary)] ">Ciudad</span>
            <input
              type="text"
              required
              value={form.city}
              onChange={(event) => setField("city", event.target.value)}
               className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:focus:border-[var(--app-primary)]"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-[var(--color-error)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--color-error)]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-[linear-gradient(180deg,var(--app-primary),var(--app-primary-strong))] px-5 py-2.5 text-sm font-semibold text-[var(--surface-3)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creando negocio..." : "Crear negocio y continuar"}
          </button>
        </form>
      </div>
    </main>
  );
}
