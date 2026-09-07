import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { LeadStatusSelect } from "./LeadStatusSelect";
import type { LeadRow } from "@/types/database";

export const metadata: Metadata = { title: "Заявки" };

export default async function AdminLeadsPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  const leads = (data ?? []) as LeadRow[];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Заявки (калькулятор, бюджет, объявления)</h1>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-neutral-200 text-left text-neutral-500">
            <tr>
              <th className="p-3">Дата</th>
              <th className="p-3">Источник</th>
              <th className="p-3">Марка/модель</th>
              <th className="p-3">Бюджет</th>
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
                <td className="p-3">{[lead.brand, lead.model].filter(Boolean).join(" ") || "—"}</td>
                <td className="p-3">{lead.budget ? `$${lead.budget}` : "—"}</td>
                <td className="p-3 font-medium">{lead.name}</td>
                <td className="p-3">
                  {lead.contact} <span className="text-neutral-400">({lead.contact_channel})</span>
                </td>
                <td className="p-3"><LeadStatusSelect leadId={lead.id} status={lead.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
