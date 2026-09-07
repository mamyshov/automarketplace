"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BODY_TYPES, TRANSMISSIONS, FUEL_TYPES, STATUS_LABELS } from "@/lib/constants";
import { FilterIcon, CloseIcon } from "@/components/icons";

export interface CatalogFilters {
  market: string;
  brand: string;
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
 * needed. */
function useCatalogFiltersDraft() {
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
    if (draft.bodyType) params.set("body", draft.bodyType);
    if (draft.transmission) params.set("transmission", draft.transmission);
    if (draft.fuel) params.set("fuel", draft.fuel);
    if (draft.status) params.set("status", draft.status);
    if (draft.yearFrom) params.set("year_from", draft.yearFrom);
    if (draft.yearTo) params.set("year_to", draft.yearTo);
    if (draft.priceFrom) params.set("price_from", draft.priceFrom);
    if (draft.priceTo) params.set("price_to", draft.priceTo);
    router.push(`/cars?${params.toString()}`);
  }

  function reset() {
    setDraft({
      market: "",
      brand: "",
      bodyType: "",
      transmission: "",
      fuel: "",
      status: "",
      yearFrom: "",
      yearTo: "",
      priceFrom: "",
      priceTo: "",
    });
    router.push("/cars");
  }

  return { draft, set, apply, reset };
}

function FilterFields({
  draft,
  set,
}: {
  draft: CatalogFilters;
  set: <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Рынок">
        <select value={draft.market} onChange={(e) => set("market", e.target.value)} className={selectCls}>
          <option value="">Все</option>
          <option value="bishkek">В наличии в Бишкеке</option>
          <option value="china">Из Китая</option>
        </select>
      </Field>

      <Field label="Марка">
        <input
          value={draft.brand}
          onChange={(e) => set("brand", e.target.value)}
          placeholder="Toyota"
          className={inputCls}
        />
      </Field>

      <Field label="Кузов">
        <select value={draft.bodyType} onChange={(e) => set("bodyType", e.target.value)} className={selectCls}>
          <option value="">Любой</option>
          {BODY_TYPES.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Год">
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            value={draft.yearFrom}
            onChange={(e) => set("yearFrom", e.target.value.replace(/\D/g, ""))}
            placeholder="от"
            className={inputCls}
          />
          <input
            inputMode="numeric"
            value={draft.yearTo}
            onChange={(e) => set("yearTo", e.target.value.replace(/\D/g, ""))}
            placeholder="до"
            className={inputCls}
          />
        </div>
      </Field>

      <Field label="Цена, $">
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            value={draft.priceFrom}
            onChange={(e) => set("priceFrom", e.target.value.replace(/\D/g, ""))}
            placeholder="от"
            className={inputCls}
          />
          <input
            inputMode="numeric"
            value={draft.priceTo}
            onChange={(e) => set("priceTo", e.target.value.replace(/\D/g, ""))}
            placeholder="до"
            className={inputCls}
          />
        </div>
      </Field>

      <Field label="Топливо">
        <select value={draft.fuel} onChange={(e) => set("fuel", e.target.value)} className={selectCls}>
          <option value="">Любое</option>
          {FUEL_TYPES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Коробка">
        <select value={draft.transmission} onChange={(e) => set("transmission", e.target.value)} className={selectCls}>
          <option value="">Любая</option>
          {TRANSMISSIONS.map((tr) => (
            <option key={tr.value} value={tr.value}>{tr.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Статус">
        <select value={draft.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
          <option value="">Любой</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function FilterActions({ onApply, onReset }: { onApply: () => void; onReset: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        type="button"
        onClick={onReset}
        className="min-h-touch flex-1 rounded-lg border border-neutral-300 font-medium text-neutral-700"
      >
        Сбросить
      </button>
      <button
        type="button"
        onClick={onApply}
        className="min-h-touch flex-1 rounded-lg bg-brand-600 font-semibold text-white"
      >
        Показать
      </button>
    </div>
  );
}

/**
 * Mobile-only trigger button + full-screen bottom sheet (spec §8: "фильтры
 * открываются полноэкранным листом снизу"). Render this once, in the page
 * header — it hides itself at md+ where FilterSidebar takes over.
 */
export function FilterTrigger() {
  const { draft, set, apply, reset } = useCatalogFiltersDraft();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-touch items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
      >
        <FilterIcon width={18} height={18} />
        Фильтры
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-neutral-900/40" onClick={() => setOpen(false)} />
          <div className="bottom-sheet-enter absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Фильтры</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть">
                <CloseIcon />
              </button>
            </div>
            <FilterFields draft={draft} set={set} />
            <FilterActions
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
export function FilterSidebar() {
  const { draft, set, apply, reset } = useCatalogFiltersDraft();

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold">Фильтры</h2>
      <FilterFields draft={draft} set={set} />
      <FilterActions onApply={apply} onReset={reset} />
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
