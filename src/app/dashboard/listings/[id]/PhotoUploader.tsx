"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addListingPhotos, deleteListingPhoto } from "@/lib/actions/listings";
import { MAX_PHOTOS_PER_LISTING } from "@/lib/constants";
import { CloseIcon } from "@/components/icons";
import { useRouter } from "next/navigation";

export interface PhotoItem {
  id: string;
  url: string;
}

export function PhotoUploader({ listingId, initialPhotos }: { listingId: string; initialPhotos: PhotoItem[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (photos.length + files.length > MAX_PHOTOS_PER_LISTING) {
      setError(`Максимум ${MAX_PHOTOS_PER_LISTING} фото на объявление`);
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const path = `${listingId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("listing-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("listing-media").getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    if (uploadedUrls.length > 0) {
      const result = await addListingPhotos(listingId, uploadedUrls);
      if (result.ok) {
        setPhotos((p) => [...p, ...uploadedUrls.map((url, i) => ({ id: `tmp-${Date.now()}-${i}`, url }))]);
        router.refresh();
      } else {
        setError(result.error ?? "Не удалось сохранить фото");
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(photoId: string) {
    setPhotos((p) => p.filter((ph) => ph.id !== photoId));
    await deleteListingPhoto(photoId, listingId);
    router.refresh();
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(photo.id)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Удалить фото"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS_PER_LISTING && (
          <label className="flex aspect-square min-h-touch cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-xs text-neutral-500 hover:border-brand-500">
            {uploading ? "Загрузка…" : "+ Добавить фото"}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <p className="mt-2 text-xs text-neutral-400">
        {photos.length}/{MAX_PHOTOS_PER_LISTING} фото. До {MAX_PHOTOS_PER_LISTING} шт., загрузка в Supabase Storage.
      </p>
    </div>
  );
}
