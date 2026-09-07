import type { Metadata } from "next";
import Link from "next/link";
import { listStaticPages } from "@/lib/data/static-pages";

export const metadata: Metadata = { title: "Контент" };

export default async function AdminPagesListPage() {
  const pages = await listStaticPages();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Статичные страницы</h1>
      <div className="flex flex-col gap-2">
        {pages.map((p) => (
          <Link
            key={p.id}
            href={`/admin/pages/${p.slug}`}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:border-brand-400"
          >
            <div>
              <div className="font-semibold text-neutral-900">{p.title}</div>
              <div className="text-xs text-neutral-500">/{p.slug}</div>
            </div>
            <span className="text-sm text-brand-600">Редактировать →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
