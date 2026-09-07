"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setOwnDealerLogo } from "@/lib/actions/dealers";

export function LogoUploader({ dealerId, logoUrl }: { dealerId: string; logoUrl: string | null }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const path = `${dealerId}/logo-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("dealer-media").upload(path, file, { upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("dealer-media").getPublicUrl(path);
    const result = await setOwnDealerLogo(data.publicUrl);
    setUploading(false);

    if (!result.ok) {
      setError(result.error ?? "Не удалось сохранить логотип");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-2xl">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Логотип" className="h-full w-full object-cover" />
        ) : (
          "🚗"
        )}
      </div>
      <label className="min-h-touch cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:border-brand-500">
        {uploading ? "Загрузка…" : "Загрузить логотип"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} disabled={uploading} />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
