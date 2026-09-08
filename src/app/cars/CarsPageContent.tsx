import Link from "next/link";
import { FilterTrigger, FilterSidebar } from "@/components/ui/FilterPanel";
import { ListingCard } from "@/components/ui/ListingCard";
import { AdBanner } from "@/components/ui/AdBanner";
import { getCatalogListings } from "@/lib/data/listings";
import { getBrandsWithModels } from "@/lib/data/brands";
import { getDictionary, type Locale } from "@/lib/i18n";

const PAGE_SIZE = 20;

export async function CarsPageContent({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Record<string, string | undefined>;
}) {
  const dict = getDictionary(locale);
  const basePath = locale === "ru" ? "/cars" : `/${locale}/cars`;

  // Sitemap subsections (spec §4) — all backed by the same catalog query with
  // different preset filters, rather than separate pages/routes.
  const quickLinks = [
    { label: dict.catalogPage.quickAll, href: basePath },
    { label: dict.catalogPage.quickBishkek, href: `${basePath}?market=bishkek` },
    { label: dict.catalogPage.quickChina, href: `${basePath}?market=china` },
    { label: dict.catalogPage.quickElectric, href: `${basePath}?body=electric` },
    { label: dict.catalogPage.quickHybrid, href: `${basePath}?fuel=hybrid` },
    { label: dict.catalogPage.quickOnOrder, href: `${basePath}?status=on_order` },
    { label: dict.catalogPage.quickNew, href: `${basePath}?mileage_max=0` },
    { label: dict.catalogPage.quickUsed, href: `${basePath}?mileage_min=1` },
  ];

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

  const [{ listings, count }, brands] = await Promise.all([
    getCatalogListings(filters, page),
    getBrandsWithModels(),
  ]);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => !!v) as [string, string][]
    );
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <datalist id="catalog-brand-options">
        {brands.map((b) => <option key={b.name} value={b.name} />)}
      </datalist>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">{dict.catalogPage.title}</h1>
        <FilterTrigger locale={locale} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {quickLinks.map((q) => (
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
          <FilterSidebar locale={locale} />
        </aside>

        <div>
          <AdBanner placement="catalog_top" className="mb-4" />

          <p className="mb-3 text-sm text-neutral-500">{count} {dict.catalogPage.count}</p>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
              {dict.catalogPage.empty}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} locale={locale} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pages">
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
