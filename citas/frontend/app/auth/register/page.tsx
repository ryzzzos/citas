"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { register } from "@/lib/api";

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

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      router.push("/auth/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
          Crear cuenta
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="hola@ejemplo.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          <Input
            id="phone"
            label="Teléfono (opcional)"
            type="tel"
            placeholder="+52 55 1234 5678"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tipo de cuenta
            </label>
            <div className="flex gap-3">
              {(["customer", "business_owner"] as Role[]).map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={() => set("role", r)}
                    className="accent-zinc-900"
                  />
                  {r === "customer" ? "Cliente" : "Negocio"}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" isLoading={loading} className="mt-2 w-full">
            Crear cuenta
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="font-medium text-zinc-900 underline dark:text-white">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
