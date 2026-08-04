"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BrandLogo from "@/components/ui/BrandLogo";
import { register } from "@/lib/api";
import { sileo } from "sileo";
import { CheckCircle2 } from "lucide-react";

type Role = "customer" | "business_owner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer" as Role,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      setIsSuccess(true);
      sileo.success({
        title: "¡Cuenta creada con éxito!",
        description: "Redirigiéndote al inicio de sesión...",
      });
      setTimeout(() => {
        const params = new URLSearchParams({
          registered: "true",
          email: form.email,
          name: form.name,
        });
        router.push(`/auth/login?${params.toString()}`);
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col">
        <div className="flex justify-center mb-8">
          <BrandLogo size={48} />
        </div>
        <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)] text-center">
          Crear cuenta
        </h1>

        {isSuccess && (
          <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-4 text-[var(--text-primary)] shadow-[var(--shadow-sm)] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)]">
                <CheckCircle2 className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  ¡Usuario registrado con éxito!
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Redirigiéndote al inicio de sesión para ingresar...
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            disabled={isSuccess}
            required
          />
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="hola@ejemplo.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            disabled={isSuccess}
            required
          />
          <Input
            id="phone"
            label="Teléfono (opcional)"
            type="tel"
            placeholder="+52 55 1234 5678"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            disabled={isSuccess}
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            disabled={isSuccess}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--text-secondary)] ">
              Tipo de cuenta
            </label>
            <div className="flex gap-3">
              {(["customer", "business_owner"] as Role[]).map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)] "
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={() => set("role", r)}
                    disabled={isSuccess}
                    className="accent-[var(--app-primary-strong)]"
                  />
                  {r === "customer" ? "Cliente" : "Negocio"}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
          <Button
            type="submit"
            isLoading={loading && !isSuccess}
            disabled={isSuccess}
            className={`mt-2 w-full transition-all ${
              isSuccess
                ? "bg-[var(--color-success)] text-white hover:bg-[var(--color-success)] opacity-100"
                : ""
            }`}
          >
            {isSuccess ? (
              <span className="flex items-center justify-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" /> ¡Cuenta creada! Redirigiendo...
              </span>
            ) : (
              "Crear cuenta"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="font-medium text-[var(--text-primary)] underline ">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

