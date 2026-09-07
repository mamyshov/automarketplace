"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import type { UserRow } from "@/types/database";

const inputCls =
  "min-h-touch w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function SettingsForm({ profile }: { profile: UserRow }) {
  const [name, setName] = useState(profile.name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? "");
  const [telegram, setTelegram] = useState(profile.telegram ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await updateProfile({ name, phone, whatsapp, telegram });
    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Имя</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Телефон</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">WhatsApp</label>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Telegram</label>
        <input value={telegram} onChange={(e) => setTelegram(e.target.value)} className={inputCls} />
      </div>
      {saved && <p className="text-sm text-success">Сохранено</p>}
      <button
        type="submit"
        disabled={saving}
        className="min-h-touch rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Сохраняем…" : "Сохранить"}
      </button>
    </form>
  );
}
