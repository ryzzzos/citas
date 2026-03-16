"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listBusinesses } from "@/lib/api";
import type { Business } from "@/types";

const CATEGORIES = ["Todos", "Spa", "Barbería", "Salón de belleza", "Consultorio", "Otro"];

export default function MarketplacePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBusinesses() {
    setLoading(true);
    try {
      const params: { city?: string; category?: string } = {};
      if (city) params.city = city;
      if (category && category !== "Todos") params.category = category;
      setBusinesses(await listBusinesses(params));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
        Buscar negocios
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Encuentra el servicio que necesitas y reserva tu cita en minutos.
      </p>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Ciudad…"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c === "Todos" ? "" : c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={loadBusinesses}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      ) : businesses.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-400">
          No se encontraron negocios. Ajusta los filtros.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <li key={b.id}>
              <Link
                href={`/marketplace/${b.id}`}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    {b.name}
                  </h2>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {b.category}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-zinc-500">
                  {b.description ?? "Sin descripción"}
                </p>
                <p className="text-xs text-zinc-400">
                  {b.city} · {b.address}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
