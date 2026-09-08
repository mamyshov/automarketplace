import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BannerRequestForm } from "./BannerRequestForm";
import { formatDate } from "@/lib/format";
import { BANNER_PLACEMENT_LABELS } from "@/lib/constants";
import { getAuthUser } from "@/lib/data/profile";
import type { BannerRow } from "@/types/database";

export const metadata: Metadata = { title: "Реклама (баннеры)" };

const STATUS_LABELS: Record<string, string> = {
  pending: "На рассмотрении",
  active: "Активен",
  expired: "Истёк",
  rejected: "Отклонён",
};

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  active: "bg-success/10 text-success",
  expired: "bg-neutral-100 text-neutral-500",
  rejected: "bg-danger/10 text-danger",
};

export default async function AdsPage() {
  const supabase = createServerSupabaseClient();
  const user = await getAuthUser();
  if (!user) return null;

  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const banners = (data ?? []) as BannerRow[];

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-neutral-900">Реклама (баннеры)</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Разовый рекламный баннер на выбранной странице сайта — отдельно от тарифов PRO/TOP/Дилер. Оплата
        подтверждается вручную, как и остальные тарифы на MVP.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="order-2 flex flex-col gap-3 lg:order-1">
          {banners.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
              У вас пока нет заявок на баннеры.
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {banner.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={banner.image_url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">{banner.title}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {BANNER_PLACEMENT_LABELS[banner.placement]} · {formatDate(banner.created_at)}
                  </div>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[banner.status]}`}>
                    {STATUS_LABELS[banner.status]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="order-1 lg:order-2">
          <BannerRequestForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}
