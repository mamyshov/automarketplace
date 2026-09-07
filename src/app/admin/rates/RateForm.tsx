"use client";

import { useState } from "react";
import { upsertCalculatorRate } from "@/lib/actions/admin";
import { BODY_TYPES } from "@/lib/constants";
import type { CalculatorRateFormInput } from "@/lib/validation";
import type { CalculatorRateRow } from "@/types/database";

const inputCls =
  "min-h-touch w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function RateForm({ existing, onDone }: { existing?: CalculatorRateRow; onDone: () => void }) {
  const [values, setValues] = useState<CalculatorRateFormInput>({
    body_type: existing?.body_type ?? "sedan",
    engine_volume_from: existing?.engine_volume_from ?? 0,
    engine_volume_to: existing?.engine_volume_to ?? 2,
    year_from: existing?.year_from ?? 2015,
    year_to: existing?.year_to ?? new Date().getFullYear(),
    logistics_fee: existing?.logistics_fee ?? 0,
    broker_fee: existing?.broker_fee ?? 0,
    customs_duty: existing?.customs_duty ?? 0,
    customs_formula: existing?.customs_formula ?? "",
    currency: existing?.currency ?? "USD",
    is_active: existing?.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CalculatorRateFormInput>(key: K, value: CalculatorRateFormInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await upsertCalculatorRate(values, existing?.id);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Ошибка сохранения");
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 rounded-lg border border-brand-200 bg-brand-50/40 p-4 sm:grid-cols-4">
      <label className="text-xs text-neutral-600">
        Кузов
        <select value={values.body_type} onChange={(e) => set("body_type", e.target.value)} className={inputCls}>
          {BODY_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </label>
      <label className="text-xs text-neutral-600">
        Объём от
        <input type="number" step="0.1" value={values.engine_volume_from} onChange={(e) => set("engine_volume_from", Number(e.target.value))} className={inputCls} />
      </label>
      <label className="text-xs text-neutral-600">
        Объём до
        <input type="number" step="0.1" value={values.engine_volume_to} onChange={(e) => set("engine_volume_to", Number(e.target.value))} className={inputCls} />
      </label>
      <label className="text-xs text-neutral-600">
        Год от
        <input type="number" value={values.year_from} onChange={(e) => set("year_from", Number(e.target.value))} className={inputCls} />
      </label>
      <label className="text-xs text-neutral-600">
        Год до
        <input type="number" value={values.year_to} onChange={(e) => set("year_to", Number(e.target.value))} className={inputCls} />
      </label>
      <label className="text-xs text-neutral-600">
        Логистика, $
        <input type="number" value={values.logistics_fee} onChange={(e) => set("logistics_fee", Number(e.target.value))} className={inputCls} />
      </label>
      <label className="text-xs text-neutral-600">
        Брокер, $
        <input type="number" value={values.broker_fee} onChange={(e) => set("broker_fee", Number(e.target.value))} className={inputCls} />
      </label>
      <label className="text-xs text-neutral-600">
        Таможня, $
        <input type="number" value={values.customs_duty} onChange={(e) => set("customs_duty", Number(e.target.value))} className={inputCls} />
      </label>
      <label className="col-span-2 text-xs text-neutral-600 sm:col-span-3">
        Комментарий (как рассчитана пошлина)
        <input value={values.customs_formula ?? ""} onChange={(e) => set("customs_formula", e.target.value)} className={inputCls} />
      </label>
      <label className="flex items-center gap-2 self-end text-xs text-neutral-600">
        <input type="checkbox" checked={values.is_active} onChange={(e) => set("is_active", e.target.checked)} />
        Активен
      </label>

      {error && <p className="col-span-full text-sm text-danger">{error}</p>}

      <div className="col-span-full flex gap-2">
        <button type="submit" disabled={saving} className="min-h-touch rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
        <button type="button" onClick={onDone} className="min-h-touch rounded-lg border border-neutral-300 px-4 py-1.5 text-sm text-neutral-700">
          Отмена
        </button>
      </div>
    </form>
  );
}
