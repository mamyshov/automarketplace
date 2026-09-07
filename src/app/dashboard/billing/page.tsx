import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestPlanButton } from "./RequestPlanButton";
import { formatDate } from "@/lib/format";
import type { SubscriptionRow, Plan } from "@/types/database";

export const metadata: Metadata = { title: "Тариф и оплата" };

const PLANS: { plan: Plan; title: string; price: string; features: string[] }[] = [
  { plan: "free", title: "Бесплатный", price: "0 $", features: ["5 активных объявлений"] },
  { plan: "pro", title: "PRO", price: "10–20 $/мес", features: ["30 объявлений", "Статистика", "Выделение объявлений", "Больше фото"] },
  { plan: "top", title: "TOP", price: "3–10 $/объявление", features: ["Поднятие в поиске", "Пометка TOP/VIP"] },
  { plan: "dealer", title: "Дилер", price: "50–150 $/мес", features: ["Профиль компании", "Безлимит объявлений", "Аналитика", "Брендирование"] },
];

const STATUS_LABELS: Record<string, string> = { pending: "На рассмотрении", active: "Активен", expired: "Истёк", rejected: "Отклонён" };

export default async function BillingPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
  const subscriptions = (data ?? []) as SubscriptionRow[];

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-neutral-900">Тариф и оплата</h1>
      <p className="mb-6 text-sm text-neutral-500">
        На MVP оплата подтверждается вручную администратором после перевода/квитанции —
        отправьте заявку, менеджер свяжется с вами для оплаты.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div key={p.plan} className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5">
            <div className="font-semibold text-neutral-900">{p.title}</div>
            <div className="mt-1 text-lg font-bold text-brand-600">{p.price}</div>
            <ul className="mt-3 flex-1 space-y-1 text-sm text-neutral-600">
              {p.features.map((f) => <li key={f}>• {f}</li>)}
            </ul>
            {p.plan !== "free" && <div className="mt-4"><RequestPlanButton plan={p.plan} /></div>}
          </div>
        ))}
      </div>

      {subscriptions.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">История заявок</h2>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="border-b border-neutral-200 text-left text-neutral-500">
                <tr><th className="p-3">Дата</th><th className="p-3">Тариф</th><th className="p-3">Статус</th></tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-100 last:border-0">
                    <td className="p-3 text-neutral-500">{formatDate(s.created_at)}</td>
                    <td className="p-3 font-medium capitalize">{s.plan}</td>
                    <td className="p-3">{STATUS_LABELS[s.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
