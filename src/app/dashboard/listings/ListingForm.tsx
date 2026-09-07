"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing, updateListing } from "@/lib/actions/listings";
import { BODY_TYPES, TRANSMISSIONS, FUEL_TYPES, STATUS_LABELS } from "@/lib/constants";
import type { ListingFormInput } from "@/lib/validation";
import type { Market, ListingStatus } from "@/types/database";

const inputCls =
  "min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export interface ListingFormProps {
  mode: "create" | "edit";
  listingId?: string;
  initial?: Partial<ListingFormInput>;
  ownDealer?: { id: string; name: string } | null;
  /** Reference list from /admin/brands, used for <datalist> autosuggestions
   * on the brand/model inputs — purely a convenience, the fields stay free
   * text so a car outside the catalog can still be listed. */
  brandCatalog?: { name: string; models: string[] }[];
}

export function ListingForm({ mode, listingId, initial, ownDealer, brandCatalog = [] }: ListingFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ListingFormInput>({
    market: initial?.market ?? "bishkek",
    brand: initial?.brand ?? "",
    model: initial?.model ?? "",
    year: initial?.year ?? new Date().getFullYear(),
    mileage: initial?.mileage ?? null,
    body_type: initial?.body_type ?? "",
    transmission: initial?.transmission ?? "",
    fuel: initial?.fuel ?? "",
    engine_volume: initial?.engine_volume ?? null,
    color: initial?.color ?? "",
    vin: initial?.vin ?? "",
    price_origin: initial?.price_origin ?? null,
    price_final: initial?.price_final ?? 0,
    status: initial?.status ?? "in_china",
    description: initial?.description ?? "",
    location: initial?.location ?? "Бишкек",
    dealer_id: initial?.dealer_id ?? null,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ListingFormInput>(key: K, value: ListingFormInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result =
      mode === "create" ? await createListing(values) : await updateListing(listingId as string, values);

    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Ошибка сохранения");
      return;
    }

    if (mode === "create" && result.id) {
      router.push(`/dashboard/listings/${result.id}/edit?created=1`);
    } else {
      router.push("/dashboard/listings");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      <Field label="Рынок">
        <div className="flex gap-2">
          {(["bishkek", "china"] as Market[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set("market", m)}
              className={`min-h-touch flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                values.market === m ? "border-brand-600 bg-brand-50 text-brand-700" : "border-neutral-300 text-neutral-700"
              }`}
            >
              {m === "bishkek" ? "В наличии в Бишкеке" : "Из Китая"}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Марка">
          <input required list="brand-options" value={values.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} />
          <datalist id="brand-options">
            {brandCatalog.map((b) => <option key={b.name} value={b.name} />)}
          </datalist>
        </Field>
        <Field label="Модель">
          <input required list="model-options" value={values.model} onChange={(e) => set("model", e.target.value)} className={inputCls} />
          <datalist id="model-options">
            {(brandCatalog.find((b) => b.name.toLowerCase() === values.brand.trim().toLowerCase())?.models ?? []).map(
              (m) => <option key={m} value={m} />
            )}
          </datalist>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Год">
          <input inputMode="numeric" required value={values.year} onChange={(e) => set("year", Number(e.target.value.replace(/\D/g, "")) || 0)} className={inputCls} />
        </Field>
        <Field label="Пробег, км">
          <input inputMode="numeric" value={values.mileage ?? ""} onChange={(e) => set("mileage", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} className={inputCls} />
        </Field>
        <Field label="Кузов">
          <select value={values.body_type ?? ""} onChange={(e) => set("body_type", e.target.value)} className={inputCls}>
            <option value="">—</option>
            {BODY_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </Field>
        <Field label="Объём двигателя, л">
          <input inputMode="decimal" value={values.engine_volume ?? ""} onChange={(e) => set("engine_volume", e.target.value ? Number(e.target.value.replace(/[^\d.]/g, "")) : null)} className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Коробка">
          <select value={values.transmission ?? ""} onChange={(e) => set("transmission", e.target.value)} className={inputCls}>
            <option value="">—</option>
            {TRANSMISSIONS.map((tItem) => <option key={tItem.value} value={tItem.value}>{tItem.label}</option>)}
          </select>
        </Field>
        <Field label="Топливо">
          <select value={values.fuel ?? ""} onChange={(e) => set("fuel", e.target.value)} className={inputCls}>
            <option value="">—</option>
            {FUEL_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </Field>
        <Field label="Цвет"><input value={values.color ?? ""} onChange={(e) => set("color", e.target.value)} className={inputCls} /></Field>
        <Field label="VIN"><input value={values.vin ?? ""} onChange={(e) => set("vin", e.target.value)} className={inputCls} /></Field>
      </div>

      {values.market === "china" && (
        <Field label="Цена в Китае, $">
          <input inputMode="numeric" value={values.price_origin ?? ""} onChange={(e) => set("price_origin", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} className={inputCls} />
        </Field>
      )}

      <Field label={values.market === "china" ? "Итоговая цена в Бишкеке, $" : "Цена, $"}>
        <input inputMode="numeric" required value={values.price_final} onChange={(e) => set("price_final", Number(e.target.value.replace(/\D/g, "")) || 0)} className={inputCls} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Статус">
          <select value={values.status} onChange={(e) => set("status", e.target.value as ListingStatus)} className={inputCls}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <Field label="Местонахождение"><input value={values.location ?? ""} onChange={(e) => set("location", e.target.value)} className={inputCls} /></Field>
      </div>

      <Field label="Описание">
        <textarea rows={5} value={values.description ?? ""} onChange={(e) => set("description", e.target.value)} className={inputCls} />
      </Field>

      {ownDealer && (
        <label className="flex min-h-touch items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={values.dealer_id === ownDealer.id}
            onChange={(e) => set("dealer_id", e.target.checked ? ownDealer.id : null)}
          />
          Опубликовать от имени компании «{ownDealer.name}»
        </label>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="min-h-touch rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Сохраняем…" : mode === "create" ? "Создать объявление" : "Сохранить изменения"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
