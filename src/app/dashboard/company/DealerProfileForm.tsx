"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertOwnDealer } from "@/lib/actions/dealers";
import type { DealerFormInput } from "@/lib/validation";
import type { DealerRow } from "@/types/database";

const inputCls =
  "min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function DealerProfileForm({ existing }: { existing: DealerRow | null }) {
  const router = useRouter();
  const [values, setValues] = useState<DealerFormInput>({
    name: existing?.name ?? "",
    description: existing?.description ?? "",
    region: existing?.region ?? "",
    phone: existing?.phone ?? "",
    whatsapp: existing?.whatsapp ?? "",
    telegram: existing?.telegram ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof DealerFormInput>(key: K, value: DealerFormInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await upsertOwnDealer(values);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Не удалось сохранить профиль");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      {!existing && (
        <p className="text-sm text-neutral-500">
          Заведите профиль компании, чтобы публиковать объявления от её имени и получить страницу в каталоге дилеров.
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Название компании</label>
        <input required value={values.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Описание</label>
        <textarea rows={4} value={values.description ?? ""} onChange={(e) => set("description", e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Регион</label>
        <input value={values.region ?? ""} onChange={(e) => set("region", e.target.value)} placeholder="Бишкек" className={inputCls} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Телефон</label>
          <input value={values.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">WhatsApp</label>
          <input value={values.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+996700000000" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Telegram</label>
          <input value={values.telegram ?? ""} onChange={(e) => set("telegram", e.target.value)} className={inputCls} />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Сохранено</p>}

      <button
        type="submit"
        disabled={saving}
        className="min-h-touch w-fit rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Сохраняем…" : existing ? "Сохранить изменения" : "Создать профиль компании"}
      </button>
    </form>
  );
}
