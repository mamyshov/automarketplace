import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { SubscriptionActions } from "./SubscriptionActions";
import type { SubscriptionRow } from "@/types/database";

export const metadata: Metadata = { title: "Тарифы" };

const STATUS_LABELS: Record<string, string> = { pending: "На рассмотрении", active: "Активен", expired: "Истёк", rejected: "Отклонён" };

export default async function AdminSubscriptionsPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*, listings(id, brand, model, year)")
    .order("created_at", { ascending: false });
  const subscriptions = (data ?? []) as (SubscriptionRow & {
    listings: { id: string; brand: string; model: string; year: number } | null;
  })[];

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-neutral-900">Заявки на тарифы</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Оплата подтверждается вручную после проверки перевода/квитанции (спецификация §5.7).
      </p>

      <div className="flex flex-col gap-2">
        {subscriptions.map((s) => (
          <div key={s.id} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <span className="font-semibold uppercase text-neutral-900">{s.plan}</span>{" "}
              <span className="text-neutral-500">· {STATUS_LABELS[s.status]} · {formatDate(s.created_at)}</span>
              {s.listings && (
                <span className="text-neutral-500">
                  {" "}
                  · объявление:{" "}
                  <a href={`/listings/${s.listings.id}`} className="text-brand-600 underline" target="_blank">
                    {s.listings.brand} {s.listings.model}, {s.listings.year}
                  </a>
                </span>
              )}
            </div>
            {s.status === "pending" && <SubscriptionActions id={s.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
