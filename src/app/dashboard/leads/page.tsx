import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { LeadRow } from "@/types/database";

export const metadata: Metadata = { title: "Заявки" };

const STATUS_LABELS: Record<string, string> = { new: "Новая", contacted: "На связи", closed: "Закрыта" };

export default async function LeadsPage() {
  const supabase = createServerSupabaseClient();
  // RLS scopes this to leads on the current user's own listings.
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  const leads = (data ?? []) as LeadRow[];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Заявки по вашим объявлениям</h1>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          Пока нет заявок с калькулятора или страниц ваших объявлений.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-neutral-200 text-left text-neutral-500">
              <tr>
                <th className="p-3">Дата</th>
                <th className="p-3">Источник</th>
                <th className="p-3">Имя</th>
                <th className="p-3">Контакт</th>
                <th className="p-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-neutral-100 last:border-0">
                  <td className="p-3 text-neutral-500">{formatDate(lead.created_at)}</td>
                  <td className="p-3">{LEAD_SOURCE_LABELS[lead.source]}</td>
                  <td className="p-3 font-medium">{lead.name}</td>
                  <td className="p-3">{lead.contact}</td>
                  <td className="p-3">{STATUS_LABELS[lead.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
