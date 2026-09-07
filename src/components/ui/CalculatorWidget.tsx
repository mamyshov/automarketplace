"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

/**
 * Homepage mini calculator (spec §5.1): 2 fields → hands off to the full
 * multi-step calculator at /china/calculator, which does the real
 * brand/model/year/engine-aware computation against calculator_rates.
 */
export function CalculatorWidget() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    trackEvent(ANALYTICS_EVENTS.CALCULATOR_OPEN, { from: "home_widget", brand, model });
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (model) params.set("model", model);
    router.push(`/china/calculator?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-neutral-700">{t.calculator.brand}</label>
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Toyota"
          className="min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-neutral-700">{t.calculator.model}</label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Camry"
          className="min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <button
        type="submit"
        className="min-h-touch rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700"
      >
        {t.calculator.calculate}
      </button>
    </form>
  );
}
