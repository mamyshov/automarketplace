import Link from "next/link";
import { getDealers } from "@/lib/data/dealers";
import { CheckBadgeIcon } from "@/components/icons";
import { getDictionary, type Locale } from "@/lib/i18n";

export async function CompaniesContent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const base = locale === "ru" ? "/companies" : `/${locale}/companies`;
  const dealers = await getDealers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900">{dict.companiesPage.title}</h1>
      <p className="mb-6 text-neutral-500">{dict.companiesPage.subtitle}</p>

      {dealers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          {dict.companiesPage.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dealers.map((dealer) => (
            <Link
              key={dealer.id}
              href={`${base}/${dealer.slug}`}
              className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5 hover:border-brand-400"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-xl">
                  {dealer.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dealer.logo_url} alt={dealer.name} className="h-full w-full object-cover" />
                  ) : (
                    "🚗"
                  )}
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">{dealer.name}</div>
                  {dealer.region && <div className="text-xs text-neutral-500">{dealer.region}</div>}
                </div>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                {dealer.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 font-medium text-brand-700">
                    <CheckBadgeIcon width={12} height={12} /> {dict.companiesPage.verifiedSupplier}
                  </span>
                )}
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-600">
                  {dealer.listingCount} {dict.companiesPage.listingsCount}
                </span>
                {dealer.rating > 0 && (
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-600">★ {dealer.rating.toFixed(1)}</span>
                )}
              </div>

              {dealer.description && <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{dealer.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
