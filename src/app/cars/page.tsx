import type { Metadata } from "next";
import { FilterTrigger, FilterSidebar } from "@/components/ui/FilterPanel";
import { ListingCard } from "@/components/ui/ListingCard";
import { getCatalogListings } from "@/lib/data/listings";
import Link from "next/link";

export const metadata: Metadata = { title: "Автомобили" };

const PAGE_SIZE = 20;

// Sitemap subsections (spec §4) — all backed by the same catalog query with
// different preset filters, rather than separate pages/routes.
const QUICK_LINKS = [
  { label: "Все автомобили", href: "/cars" },
  { label: "В наличии в Бишкеке", href: "/cars?market=bishkek" },
  { label: "Из Китая", href: "/cars?market=china" },
  { label: "Электромобили", href: "/cars?body=electric" },
  { label: "Гибриды", href: "/cars?fuel=hybrid" },
  { label: "Под заказ", href: "/cars?status=on_order" },
  { label: "Новые", href: "/cars?mileage_max=0" },
  { label: "С пробегом", href: "/cars?mileage_min=1" },
];

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  const filters = {
    market: searchParams.market ?? "",
    brand: searchParams.brand ?? "",
    model: searchParams.model ?? "",
    bodyType: searchParams.body ?? "",
    transmission: searchParams.transmission ?? "",
    fuel: searchParams.fuel ?? "",
    status: searchParams.status ?? "",
    yearFrom: searchParams.year_from ?? "",
    yearTo: searchParams.year_to ?? "",
    priceFrom: searchParams.price_from ?? "",
    priceTo: searchParams.price_to ?? "",
    mileageMax: searchParams.mileage_max ?? "",
    mileageMin: searchParams.mileage_min ?? "",
  };

  const { listings, count } = await getCatalogListings(filters, page);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => !!v) as [string, string][]
    );
    params.set("page", String(p));
    return `/cars?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Автомобили</h1>
        <FilterTrigger />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-brand-500 hover:text-brand-600"
          >
            {q.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block">
          <FilterSidebar />
        </aside>

        <div>
          <p className="mb-3 text-sm text-neutral-500">{count} объявлений</p>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
              По этим фильтрам пока ничего не найдено.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Страницы">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`min-h-touch min-w-touch flex items-center justify-center rounded-lg px-3 text-sm font-medium ${
                    p === page ? "bg-brand-600 text-white" : "border border-neutral-300 text-neutral-700"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
