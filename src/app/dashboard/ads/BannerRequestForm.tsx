"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { requestBanner } from "@/lib/actions/banners";
import { BANNER_PLACEMENT_LABELS } from "@/lib/constants";
import type { BannerPlacement } from "@/types/database";

export function BannerRequestForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [placement, setPlacement] = useState<BannerPlacement>("home_top");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Выберите изображение баннера");
      return;
    }
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("banner-media").upload(path, file, { upsert: false });
    if (uploadError) {
      setError(uploadError.message);
      setSubmitting(false);
      return;
    }
    const { data: publicUrl } = supabase.storage.from("banner-media").getPublicUrl(path);

    const result = await requestBanner({ title, linkUrl, imageUrl: publicUrl.publicUrl, placement });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Не удалось отправить заявку");
      return;
    }

    setTitle("");
    setLinkUrl("");
    setFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="font-semibold text-neutral-900">Новая заявка на баннер</h2>

      <label className="text-sm font-medium text-neutral-700">
        Название (для вас, не показывается на сайте)
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Например: акция к 8 марта"
        />
      </label>

      <label className="text-sm font-medium text-neutral-700">
        Место размещения
        <select
          value={placement}
          onChange={(e) => setPlacement(e.target.value as BannerPlacement)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {Object.entries(BANNER_PLACEMENT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-neutral-700">
        Ссылка при клике
        <input
          type="url"
          required
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </label>

      <label className="text-sm font-medium text-neutral-700">
        Изображение баннера
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm"
        />
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="min-h-touch self-start rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Отправляем…" : "Отправить заявку"}
      </button>
      <p className="text-xs text-neutral-500">
        После отправки менеджер свяжется с вами для оплаты и подтвердит показ баннера (как и с остальными тарифами
        на MVP — см. «Тариф и оплата»).
      </p>
    </form>
  );
}
