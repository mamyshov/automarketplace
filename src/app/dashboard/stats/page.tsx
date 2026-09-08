import Link from "next/link";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasStatsAccess } from "@/lib/data/subscriptions";
import { getSellerStats } from "@/lib/data/stats";
import { getAuthUser } from "@/lib/data/profile";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Статистика" };

const LEAD_STATUS_LABELS: Record<string, string> = { new: "Новая", contacted: "На связи", closed: "Закрыта" };

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="text-2xl font-bold text-neutral-900">{value}</div>
      <div className="text-sm text-neutral-500">{label}</div>
    </div>
  );
}

export default async function StatsPage() {
  const supabase = createServerSupabaseClient();
  const user = await getAuthUser();
  if (!user) return null;

  const hasAccess = await hasStatsAccess(supabase, user.id);

  if (!hasAccess) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-bold text-neutral-900">Статистика</h1>
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <p className="mb-4 text-neutral-600">
            Статистика по просмотрам и заявкам, а также аналитика по компании — доступны на тарифах PRO и Дилер
            (спецификация §5.7).
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-block min-h-touch rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Посмотреть тарифы
          </Link>
        </div>
      </div>
    );
  }

  const stats = await getSellerStats(supabase, user.id);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Статистика</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Активные объявления" value={stats.totalActiveListings} />
        <StatTile label="Всего просмотров" value={stats.totalViews} />
        <StatTile label="Заявок всего" value={stats.totalLeads} />
        <StatTile label="Заявок за 30 дней" value={stats.leadsLast30Days} />
      </div>

      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Заявки по статусу</h2>
        <div className="flex flex-col gap-2">
          {(Object.keys(LEAD_STATUS_LABELS) as (keyof typeof stats.leadsByStatus)[]).map((status) => {
            const count = stats.leadsByStatus[status];
            const pct = stats.totalLeads ? Math.round((count / stats.totalLeads) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 text-neutral-600">{LEAD_STATUS_LABELS[status]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-medium text-neutral-900">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Топ объявлений по просмотрам</h2>
        {stats.topListings.length === 0 ? (
          <p className="text-sm text-neutral-500">Пока нет объявлений.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="border-b border-neutral-200 text-left text-neutral-500">
                <tr>
                  <th className="p-2">Объявление</th>
                  <th className="p-2">Статус</th>
                  <th className="p-2 text-right">Просмотры</th>
                </tr>
              </thead>
              <tbody>
                {stats.topListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-neutral-100 last:border-0">
                    <td className="p-2">
                      <Link href={`/listings/${listing.id}`} className="font-medium text-neutral-900 hover:text-brand-600">
                        {listing.brand} {listing.model}, {listing.year}
                      </Link>
                      {listing.is_top && (
                        <span className="ml-2 rounded-full bg-warning/10 px-1.5 py-0.5 text-xs font-semibold uppercase text-warning">
                          TOP
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      <StatusBadge status={listing.status} />
                    </td>
                    <td className="p-2 text-right font-medium text-neutral-900">{listing.views_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
