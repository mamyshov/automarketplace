"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BODY_TYPES, TRANSMISSIONS, FUEL_TYPES } from "@/lib/constants";
import { FilterIcon, CloseIcon } from "@/components/icons";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ListingStatus } from "@/types/database";

const STATUS_VALUES: ListingStatus[] = ["available", "in_transit", "in_china", "on_order", "sold"];

export interface CatalogFilters {
  market: string;
  brand: string;
  model: string;
  bodyType: string;
  transmission: string;
  fuel: string;
  status: string;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
}

function readFilters(params: URLSearchParams): CatalogFilters {
  return {
    market: params.get("market") ?? "",
    brand: params.get("brand") ?? "",
    model: params.get("model") ?? "",
    bodyType: params.get("body") ?? "",
    transmission: params.get("transmission") ?? "",
    fuel: params.get("fuel") ?? "",
    status: params.get("status") ?? "",
    yearFrom: params.get("year_from") ?? "",
    yearTo: params.get("year_to") ?? "",
    priceFrom: params.get("price_from") ?? "",
    priceTo: params.get("price_to") ?? "",
  };
}

/** Shared state + apply/reset logic behind both filter UIs below. Each is
 * rendered exactly once on the page (mobile trigger vs. desktop sidebar),
 * so each gets its own independent draft state — no cross-instance sync
 * needed. `basePath` is `/cars` or `/en/cars` depending which mirror the
 * page belongs to. */
function useCatalogFiltersDraft(basePath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<CatalogFilters>(() => readFilters(searchParams));

  function set<K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function apply() {
    const params = new URLSearchParams();
    if (draft.market) params.set("market", draft.market);
    if (draft.brand) params.set("brand", draft.brand);
    if (draft.model) params.set("model", draft.model);
    if (draft.bodyType) params.set("body", draft.bodyType);
    if (draft.transmission) params.set("transmission", draft.transmission);
    if (draft.fuel) params.set("fuel", draft.fuel);
    if (draft.status) params.set("status", draft.status);
    if (draft.yearFrom) params.set("year_from", draft.yearFrom);
    if (draft.yearTo) params.set("year_to", draft.yearTo);
    if (draft.priceFrom) params.set("price_from", draft.priceFrom);
    if (draft.priceTo) params.set("price_to", draft.priceTo);
    router.push(`${basePath}?${params.toString()}`);
  }

  function reset() {
    setDraft({
      market: "",
      brand: "",
      model: "",
      bodyType: "",
      transmission: "",
      fuel: "",
      status: "",
      yearFrom: "",
      yearTo: "",
      priceFrom: "",
      priceTo: "",
    });
    router.push(basePath);
  }

  return { draft, set, apply, reset };
}

function FilterFields({
  draft,
  set,
  dict,
}: {
  draft: CatalogFilters;
  set: <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => void;
  dict: ReturnType<typeof getDictionary>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field label={dict.filters.market}>
        <select value={draft.market} onChange={(e) => set("market", e.target.value)} className={selectCls}>
          <option value="">{dict.filters.marketAll}</option>
          <option value="bishkek">{dict.filters.marketBishkek}</option>
          <option value="china">{dict.filters.marketChina}</option>
        </select>
      </Field>

      <Field label={dict.filters.brand}>
        <input
          list="catalog-brand-options"
          value={draft.brand}
          onChange={(e) => set("brand", e.target.value)}
          placeholder="Toyota"
          className={inputCls}
        />
      </Field>

      <Field label={dict.filters.model}>
        <input
          value={draft.model}
          onChange={(e) => set("model", e.target.value)}
          placeholder="Camry"
          className={inputCls}
        />
      </Field>

      <Field label={dict.filters.bodyType}>
        <select value={draft.bodyType} onChange={(e) => set("bodyType", e.target.value)} className={selectCls}>
          <option value="">{dict.filters.bodyAny}</option>
          {BODY_TYPES.map((b) => (
            <option key={b.value} value={b.value}>{dict.options.bodyTypes[b.value as keyof typeof dict.options.bodyTypes]}</option>
          ))}
        </select>
      </Field>

      <Field label={dict.filters.year}>
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            value={draft.yearFrom}
            onChange={(e) => set("yearFrom", e.target.value.replace(/\D/g, ""))}
            placeholder={dict.filters.rangeFrom}
            className={inputCls}
          />
          <input
            inputMode="numeric"
            value={draft.yearTo}
            onChange={(e) => set("yearTo", e.target.value.replace(/\D/g, ""))}
            placeholder={dict.filters.rangeTo}
            className={inputCls}
          />
        </div>
      </Field>

      <Field label={dict.filters.price}>
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            value={draft.priceFrom}
            onChange={(e) => set("priceFrom", e.target.value.replace(/\D/g, ""))}
            placeholder={dict.filters.rangeFrom}
            className={inputCls}
          />
          <input
            inputMode="numeric"
            value={draft.priceTo}
            onChange={(e) => set("priceTo", e.target.value.replace(/\D/g, ""))}
            placeholder={dict.filters.rangeTo}
            className={inputCls}
          />
        </div>
      </Field>

      <Field label={dict.filters.fuel}>
        <select value={draft.fuel} onChange={(e) => set("fuel", e.target.value)} className={selectCls}>
          <option value="">{dict.filters.fuelAny}</option>
          {FUEL_TYPES.map((f) => (
            <option key={f.value} value={f.value}>{dict.options.fuelTypes[f.value as keyof typeof dict.options.fuelTypes]}</option>
          ))}
        </select>
      </Field>

      <Field label={dict.filters.transmission}>
        <select value={draft.transmission} onChange={(e) => set("transmission", e.target.value)} className={selectCls}>
          <option value="">{dict.filters.transmissionAny}</option>
          {TRANSMISSIONS.map((tr) => (
            <option key={tr.value} value={tr.value}>{dict.options.transmissions[tr.value as keyof typeof dict.options.transmissions]}</option>
          ))}
        </select>
      </Field>

      <Field label={dict.filters.status}>
        <select value={draft.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
          <option value="">{dict.filters.statusAny}</option>
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>{dict.status[value]}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function FilterActions({
  onApply,
  onReset,
  dict,
}: {
  onApply: () => void;
  onReset: () => void;
  dict: ReturnType<typeof getDictionary>;
}) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        type="button"
        onClick={onReset}
        className="min-h-touch flex-1 rounded-lg border border-neutral-300 font-medium text-neutral-700"
      >
        {dict.filters.reset}
      </button>
      <button
        type="button"
        onClick={onApply}
        className="min-h-touch flex-1 rounded-lg bg-brand-600 font-semibold text-white"
      >
        {dict.filters.apply}
      </button>
    </div>
  );
}

/**
 * Mobile-only trigger button + full-screen bottom sheet (spec §8: "фильтры
 * открываются полноэкранным листом снизу"). Render this once, in the page
 * header — it hides itself at md+ where FilterSidebar takes over.
 */
export function FilterTrigger({ locale = "ru" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const basePath = locale === "ru" ? "/cars" : `/${locale}/cars`;
  const { draft, set, apply, reset } = useCatalogFiltersDraft(basePath);
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-touch items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
      >
        <FilterIcon width={18} height={18} />
        {dict.filters.trigger}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-neutral-900/40" onClick={() => setOpen(false)} />
          <div className="bottom-sheet-enter absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{dict.filters.title}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>
            <FilterFields draft={draft} set={set} dict={dict} />
            <FilterActions
              dict={dict}
              onApply={() => {
                apply();
                setOpen(false);
              }}
              onReset={() => {
                reset();
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Always-visible desktop sidebar. Render this once, inside a `hidden
 * md:block` wrapper in the page layout — it doesn't hide itself, the parent
 * controls that, so it never doubles up with FilterTrigger's own markup.
 */
export function FilterSidebar({ locale = "ru" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const basePath = locale === "ru" ? "/cars" : `/${locale}/cars`;
  const { draft, set, apply, reset } = useCatalogFiltersDraft(basePath);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold">{dict.filters.title}</h2>
      <FilterFields draft={draft} set={set} dict={dict} />
      <FilterActions onApply={apply} onReset={reset} dict={dict} />
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
const selectCls = inputCls;
