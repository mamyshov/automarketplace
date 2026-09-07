import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Обзор" };

export default async function AdminOverviewPage() {
  const supabase = createServerSupabaseClient();

  const [pending, leads, activeListings, pendingSubs] = await Promise.all([
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("moderation_status", "pending"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("moderation_status", "approved"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const cards = [
    { label: "На модерации", value: pending.count ?? 0, href: "/admin/moderation" },
    { label: "Новые заявки", value: leads.count ?? 0, href: "/admin/leads" },
    { label: "Опубликовано объявлений", value: activeListings.count ?? 0, href: "/admin/moderation" },
    { label: "Заявки на тариф", value: pendingSubs.count ?? 0, href: "/admin/subscriptions" },
  ];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Обзор</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-brand-400">
            <div className="text-3xl font-bold text-neutral-900">{c.value}</div>
            <div className="mt-1 text-sm text-neutral-500">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
