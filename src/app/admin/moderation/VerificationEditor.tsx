"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setListingVerified } from "@/lib/actions/admin";
import type { ListingPhotoRow, ListingVideoRow } from "@/types/database";

export interface VerificationEditorProps {
  listingId: string;
  isVerified: boolean;
  verifiedNote: string | null;
  verifiedByName: string | null;
  photos: Pick<ListingPhotoRow, "id" | "url" | "is_verification">[];
  videos: Pick<ListingVideoRow, "id" | "url" | "is_verification">[];
}

export function VerificationEditor({
  listingId,
  isVerified,
  verifiedNote,
  verifiedByName,
  photos,
  videos,
}: VerificationEditorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(isVerified);
  const [note, setNote] = useState(verifiedNote ?? "");
  const [byName, setByName] = useState(verifiedByName ?? "");
  const [photoIds, setPhotoIds] = useState(new Set(photos.filter((p) => p.is_verification).map((p) => p.id)));
  const [videoIds, setVideoIds] = useState(new Set(videos.filter((v) => v.is_verification).map((v) => v.id)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(set: Set<string>, id: string, updater: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updater(next);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await setListingVerified(listingId, {
      verified,
      note: note || undefined,
      byName: byName || undefined,
      verificationPhotoIds: Array.from(photoIds),
      verificationVideoIds: Array.from(videoIds),
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Не удалось сохранить");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="min-h-touch rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700"
      >
        {isVerified ? "✅ Проверка" : "Проверка"} {open ? "▴" : "▾"}
      </button>

      {open && (
        <div className="mt-3 flex w-full flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:w-96">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
            Проверено площадкой
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-neutral-700">Кто проверял</span>
            <input
              value={byName}
              onChange={(e) => setByName(e.target.value)}
              placeholder="Имя модератора/инспектора"
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-neutral-700">Заключение (состояние кузова/двигателя и т.п.)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>

          {photos.length > 0 && (
            <div className="text-sm">
              <span className="mb-1 block font-medium text-neutral-700">Фото диагностики</span>
              <div className="grid grid-cols-4 gap-1.5">
                {photos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(photoIds, p.id, setPhotoIds)}
                    className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                      photoIds.has(p.id) ? "border-success" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                    {photoIds.has(p.id) && (
                      <span className="absolute right-0.5 top-0.5 rounded-full bg-success px-1 text-[10px] text-white">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div className="text-sm">
              <span className="mb-1 block font-medium text-neutral-700">Видео диагностики</span>
              <div className="flex flex-col gap-1">
                {videos.map((v) => (
                  <label key={v.id} className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={videoIds.has(v.id)}
                      onChange={() => toggle(videoIds, v.id, setVideoIds)}
                    />
                    <span className="truncate text-neutral-600">{v.url}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="min-h-touch rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
      )}
    </div>
  );
}
