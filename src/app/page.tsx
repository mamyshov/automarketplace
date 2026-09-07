import Link from "next/link";
import { CalculatorWidget } from "@/components/ui/CalculatorWidget";
import { BudgetWidget } from "@/components/ui/BudgetWidget";
import { ListingCard } from "@/components/ui/ListingCard";
import { getFeaturedListings } from "@/lib/data/listings";
import { t } from "@/lib/i18n";
import { ChevronRightIcon } from "@/components/icons";

export default async function HomePage() {
  const [bishkekListings, chinaListings] = await Promise.all([
    getFeaturedListings("bishkek", 4),
    getFeaturedListings("china", 4),
  ]);

  return (
    <div>
      {/* Hero: two visually equal but distinct CTAs (spec §5.1) */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-16">
          <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
            {t.home.heroTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-neutral-600">{t.home.heroSubtitle}</p>

          <div className="mx-auto mt-6 grid grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2">
            <Link
              href="/cars"
              className="flex min-h-touch items-center justify-between rounded-xl bg-neutral-900 px-5 py-4 font-semibold text-white transition hover:bg-neutral-800"
            >
              {t.home.ctaBrowse}
              <ChevronRightIcon />
            </Link>
            <Link
              href="/china/calculator"
              className="flex min-h-touch items-center justify-between rounded-xl bg-accent-500 px-5 py-4 font-semibold text-white transition hover:bg-accent-600"
            >
              {t.home.ctaChina}
              <ChevronRightIcon />
            </Link>
          </div>

          <div className="mx-auto mt-8 max-w-2xl text-left">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {t.home.calculatorWidgetTitle}
            </h2>
            <CalculatorWidget />
          </div>
        </div>
      </section>

      {/* Budget picker */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-neutral-900">{t.home.budgetWidgetTitle}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Введите бюджет — покажем подходящие автомобили из Китая под ваш бюджет.
          </p>
          <BudgetWidget className="mt-4 max-w-md" />
        </div>
      </section>

      {/* Dual-market showcase */}
      <MarketSection
        title={t.home.bishkekMarket}
        href="/cars?market=bishkek"
        listings={bishkekListings}
        accent="brand"
      />
      <MarketSection
        title={`🇨🇳 ${t.home.chinaMarket}`}
        href="/cars?market=china"
        listings={chinaListings}
        accent="accent"
      />
    </div>
  );
}

const ACCENT_LINK_CLASSES: Record<"brand" | "accent", string> = {
  brand: "text-sm font-medium text-brand-600 hover:underline",
  accent: "text-sm font-medium text-accent-600 hover:underline",
};

function MarketSection({
  title,
  href,
  listings,
  accent,
}: {
  title: string;
  href: string;
  listings: Awaited<ReturnType<typeof getFeaturedListings>>;
  accent: "brand" | "accent";
}) {
  if (listings.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
        <Link href={href} className={ACCENT_LINK_CLASSES[accent]}>
          {t.home.viewAll}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
