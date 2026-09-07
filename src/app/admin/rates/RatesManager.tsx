"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RateForm } from "./RateForm";
import { deleteCalculatorRate } from "@/lib/actions/admin";
import { BODY_TYPES } from "@/lib/constants";
import type { CalculatorRateRow } from "@/types/database";

const bodyLabel = (v: string) => BODY_TYPES.find((b) => b.value === v)?.label ?? v;

export function RatesManager({ rates }: { rates: CalculatorRateRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function refresh() {
    setCreating(false);
    setEditingId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-500">Тарифы читаются калькулятором напрямую из этой таблицы.</p>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="min-h-touch rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Добавить тариф
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-4">
          <RateForm onDone={refresh} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {rates.map((rate) =>
          editingId === rate.id ? (
            <RateForm key={rate.id} existing={rate} onDone={refresh} />
          ) : (
            <div key={rate.id} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <span className="font-semibold text-neutral-900">{bodyLabel(rate.body_type)}</span>{" "}
                <span className="text-neutral-500">
                  {rate.engine_volume_from}–{rate.engine_volume_to}л, {rate.year_from}–{rate.year_to}г
                </span>
                <div className="text-neutral-600">
                  Логистика ${rate.logistics_fee} · Брокер ${rate.broker_fee} · Таможня ${rate.customs_duty}
                  {!rate.is_active && <span className="ml-2 text-danger">(неактивен)</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingId(rate.id)} className="min-h-touch rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700">
                  Изменить
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Удалить тариф?")) return;
                    await deleteCalculatorRate(rate.id);
                    router.refresh();
                  }}
                  className="min-h-touch rounded-lg px-3 py-1.5 text-sm font-medium text-danger"
                >
                  Удалить
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
