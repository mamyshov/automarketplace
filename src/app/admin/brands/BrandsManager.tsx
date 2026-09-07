"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrand, deleteBrand, createModel, deleteModel } from "@/lib/actions/brands";
import type { BrandWithModels } from "@/lib/data/brands";

export function BrandsManager({ brands }: { brands: BrandWithModels[] }) {
  const router = useRouter();
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    const result = await fn();
    setBusy(false);
    if (!result.ok) setError(result.error ?? "Ошибка");
    router.refresh();
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => createBrand(newBrand)).then(() => setNewBrand(""));
        }}
        className="mb-6 flex max-w-md gap-2"
      >
        <input
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          placeholder="Новая марка, например Toyota"
          className="min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="min-h-touch shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Добавить
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <div key={brand.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-neutral-900">{brand.name}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!confirm(`Удалить марку «${brand.name}» вместе с её моделями?`)) return;
                  run(() => deleteBrand(brand.id));
                }}
                className="text-xs font-medium text-danger"
              >
                Удалить
              </button>
            </div>

            <ul className="mb-3 flex flex-col gap-1">
              {brand.models.map((model) => (
                <li key={model.id} className="flex items-center justify-between text-sm text-neutral-600">
                  {model.name}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => deleteModel(model.id))}
                    className="text-xs text-neutral-400 hover:text-danger"
                  >
                    ✕
                  </button>
                </li>
              ))}
              {brand.models.length === 0 && <li className="text-sm text-neutral-400">Нет моделей</li>}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const value = newModel[brand.id] ?? "";
                run(() => createModel(brand.id, value)).then(() =>
                  setNewModel((m) => ({ ...m, [brand.id]: "" }))
                );
              }}
              className="flex gap-2"
            >
              <input
                value={newModel[brand.id] ?? ""}
                onChange={(e) => setNewModel((m) => ({ ...m, [brand.id]: e.target.value }))}
                placeholder="Новая модель"
                className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                disabled={busy}
                className="shrink-0 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm font-medium text-neutral-700 disabled:opacity-60"
              >
                +
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
