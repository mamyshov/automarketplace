"use client";

import { useEffect, useState } from "react";
import { calculateEstimate } from "@/lib/actions/calculator";
import { PriceBreakdown } from "@/components/ui/PriceBreakdown";
import { LeadForm } from "@/components/ui/LeadForm";
import { BODY_TYPES } from "@/lib/constants";
import { getDictionary, type Locale } from "@/lib/i18n";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";
import type { CalculatorBreakdown } from "@/types/database";

const CURRENT_YEAR = new Date().getFullYear();

export function CalculatorForm({
  initialBrand = "",
  initialModel = "",
  locale = "ru",
}: {
  initialBrand?: string;
  initialModel?: string;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  const [brand, setBrand] = useState(initialBrand);
  const [model, setModel] = useState(initialModel);
  const [year, setYear] = useState(String(CURRENT_YEAR - 1));
  const [bodyType, setBodyType] = useState("sedan");
  const [engineVolume, setEngineVolume] = useState("2.0");
  const [priceChina, setPriceChina] = useState("");

  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [breakdown, setBreakdown] = useState<CalculatorBreakdown | null>(null);
  const [approximate, setApproximate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.CALCULATOR_OPEN, { from: "china_calculator" });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);

    const result = await calculateEstimate({
      bodyType,
      engineVolume: Number(engineVolume) || 0,
      year: Number(year) || CURRENT_YEAR,
      priceChina: Number(priceChina) || 0,
    });

    if (result.ok && result.breakdown) {
      setBreakdown(result.breakdown);
      setApproximate(!!result.approximate);
      setState("done");
      trackEvent(ANALYTICS_EVENTS.CALCULATOR_SUBMIT, { brand, model, year, bodyType, total: result.breakdown.total });
    } else {
      setState("error");
      setError(result.error ?? dict.calculator.genericError);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label={dict.calculator.brand}>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Toyota" className={inputCls} />
          </Field>
          <Field label={dict.calculator.model}>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={dict.calculator.year}>
            <input
              inputMode="numeric"
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
              className={inputCls}
            />
          </Field>
          <Field label={dict.calculator.engineVolume}>
            <input
              inputMode="decimal"
              value={engineVolume}
              onChange={(e) => setEngineVolume(e.target.value.replace(/[^\d.]/g, ""))}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label={dict.calculator.bodyType}>
          <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className={inputCls}>
            {BODY_TYPES.map((b) => (
              <option key={b.value} value={b.value}>
                {dict.options.bodyTypes[b.value as keyof typeof dict.options.bodyTypes]}
              </option>
            ))}
          </select>
        </Field>

        <Field label={dict.calculator.priceChina}>
          <input
            inputMode="numeric"
            required
            value={priceChina}
            onChange={(e) => setPriceChina(e.target.value.replace(/\D/g, ""))}
            placeholder="19800"
            className={inputCls}
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={state === "loading"}
          className="min-h-touch rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {state === "loading" ? dict.calculator.calculating : dict.calculator.calculate}
        </button>
      </form>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        {breakdown ? (
          <>
            {approximate && (
              <p className="mb-3 rounded-lg bg-warning/10 p-2 text-xs text-warning">{dict.calculator.approximateNote}</p>
            )}
            <PriceBreakdown breakdown={breakdown} locale={locale} />
            <div className="mt-6 border-t border-neutral-100 pt-4">
              <h3 className="mb-2 text-sm font-semibold text-neutral-700">{dict.listing.getExactQuote}</h3>
              <LeadForm
                source="calculator"
                brand={brand}
                model={model}
                year={Number(year) || undefined}
                calculatorBreakdown={breakdown}
                locale={locale}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-500">{dict.calculator.placeholder}</p>
        )}
      </div>
    </div>
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

const inputCls =
  "min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
