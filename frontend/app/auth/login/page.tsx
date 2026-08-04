"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BrandLogo from "@/components/ui/BrandLogo";
import { login } from "@/lib/api";
import { sileo } from "sileo";
import { CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registered = searchParams.get("registered") === "true";
  const registeredEmail = searchParams.get("email") || "";
  const registeredName = searchParams.get("name") || "";

  const [form, setForm] = useState({ email: registeredEmail, password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registeredEmail && !form.email) {
      setForm((prev) => ({ ...prev, email: registeredEmail }));
    }
  }, [registeredEmail, form.email]);

  useEffect(() => {
    if (registered) {
      sileo.success({
        title: "¡Cuenta registrada!",
        description: "Ingresa tu contraseña para continuar.",
      });
    }
  }, [registered]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col">
        <div className="flex justify-center mb-8">
          <BrandLogo size={48} />
        </div>
        <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)] text-center">
          Iniciar sesión
        </h1>

        {registered && (
          <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-4 text-[var(--text-primary)] shadow-[var(--shadow-sm)] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)] mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  ¡Cuenta creada con éxito!
                </h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {registeredName ? `¡Hola ${registeredName}! ` : ""}Tu usuario ha sido registrado correctamente. Hemos preparado tu correo para que solo ingreses tu contraseña e inicies sesión.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="hola@ejemplo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoFocus={registered}
            required
          />
          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
          <Button type="submit" isLoading={loading} className="mt-2 w-full">
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="font-medium text-[var(--text-primary)] underline ">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

