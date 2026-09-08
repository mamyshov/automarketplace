import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { BANNER_PLACEMENT_LABELS } from "@/lib/constants";
import { BannerActions } from "./BannerActions";
import type { BannerRow } from "@/types/database";

export const metadata: Metadata = { title: "Баннеры" };

const STATUS_LABELS: Record<string, string> = {
  pending: "На рассмотрении",
  active: "Активен",
  expired: "Истёк",
  rejected: "Отклонён",
};

export default async function AdminBannersPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("banners")
    .select("*, users(name, phone)")
    .order("created_at", { ascending: false });
  const banners = (data ?? []) as (BannerRow & { users: { name: string | null; phone: string | null } | null })[];

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-neutral-900">Заявки на баннеры</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Оплата подтверждается вручную после проверки перевода/квитанции — как и остальные тарифы (спецификация §5.7).
      </p>

      <div className="flex flex-col gap-3">
        {banners.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            Пока нет заявок на баннеры.
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {banner.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={banner.image_url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>

              <div className="flex-1 text-sm">
                <div className="font-semibold text-neutral-900">{banner.title}</div>
                <div className="mt-1 text-neutral-500">
                  {BANNER_PLACEMENT_LABELS[banner.placement]} · {STATUS_LABELS[banner.status]} · {formatDate(banner.created_at)}
                </div>
                <div className="mt-1 text-neutral-500">
                  {banner.users?.name ?? "Без имени"}
                  {banner.users?.phone ? ` · ${banner.users.phone}` : ""}
                </div>
                <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-brand-600 hover:underline">
                  {banner.link_url}
                </a>
              </div>

              <BannerActions id={banner.id} status={banner.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
