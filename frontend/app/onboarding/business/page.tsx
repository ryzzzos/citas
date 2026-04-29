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
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100/50 px-4 py-10 dark:from-zinc-950 dark:via-zinc-950 dark:to-blue-950/20">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_25px_55px_-35px_rgba(0,0,0,0.6)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85 md:p-8">
        <p className="mb-2 inline-flex items-center rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:border-amber-500/40 dark:bg-amber-400/10 dark:text-amber-200">
          Onboarding obligatorio
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
          Completa tu perfil de negocio
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Antes de usar agenda y panel de negocio, necesitas crear el perfil principal de tu negocio.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nombre del negocio</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Categoría</span>
            <input
              type="text"
              required
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Teléfono</span>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Correo de negocio</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Dirección</span>
            <input
              type="text"
              required
              value={form.address}
              onChange={(event) => setField("address", event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ciudad</span>
            <input
              type="text"
              required
              value={form.city}
              onChange={(event) => setField("city", event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Creando negocio..." : "Crear negocio y continuar"}
          </button>
        </form>
      </div>
    </main>
  );
}
