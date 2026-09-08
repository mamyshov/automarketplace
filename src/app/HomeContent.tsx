import Link from "next/link";
import { CalculatorWidget } from "@/components/ui/CalculatorWidget";
import { BudgetWidget } from "@/components/ui/BudgetWidget";
import { ListingCard } from "@/components/ui/ListingCard";
import { AdBanner } from "@/components/ui/AdBanner";
import { getFeaturedListings } from "@/lib/data/listings";
import { getDictionary, type Locale } from "@/lib/i18n";
import { ChevronRightIcon } from "@/components/icons";

export async function HomeContent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const basePath = (p: string) => (locale === "ru" ? p : `/${locale}${p}`);

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
            {dict.home.heroTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-neutral-600">{dict.home.heroSubtitle}</p>

          <div className="mx-auto mt-6 grid grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2">
            <Link
              href={basePath("/cars")}
              className="flex min-h-touch items-center justify-between rounded-xl bg-neutral-900 px-5 py-4 font-semibold text-white transition hover:bg-neutral-800"
            >
              {dict.home.ctaBrowse}
              <ChevronRightIcon />
            </Link>
            <Link
              href={basePath("/china/calculator")}
              className="flex min-h-touch items-center justify-between rounded-xl bg-accent-500 px-5 py-4 font-semibold text-white transition hover:bg-accent-600"
            >
              {dict.home.ctaChina}
              <ChevronRightIcon />
            </Link>
          </div>

          <div className="mx-auto mt-8 max-w-2xl text-left">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {dict.home.calculatorWidgetTitle}
            </h2>
            <CalculatorWidget locale={locale} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <AdBanner placement="home_top" />
      </div>

      {/* Budget picker */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-neutral-900">{dict.home.budgetWidgetTitle}</h2>
          <p className="mt-1 text-sm text-neutral-500">{dict.home.budgetSubtitle}</p>
          <BudgetWidget className="mt-4 max-w-md" locale={locale} />
        </div>
      </section>

      {/* Dual-market showcase */}
      <MarketSection
        title={dict.home.bishkekMarket}
        href={basePath("/cars?market=bishkek")}
        listings={bishkekListings}
        accent="brand"
        locale={locale}
        viewAllLabel={dict.home.viewAll}
      />
      <MarketSection
        title={`🇨🇳 ${dict.home.chinaMarket}`}
        href={basePath("/cars?market=china")}
        listings={chinaListings}
        accent="accent"
        locale={locale}
        viewAllLabel={dict.home.viewAll}
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
  locale,
  viewAllLabel,
}: {
  title: string;
  href: string;
  listings: Awaited<ReturnType<typeof getFeaturedListings>>;
  accent: "brand" | "accent";
  locale: Locale;
  viewAllLabel: string;
}) {
  if (listings.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
        <Link href={href} className={ACCENT_LINK_CLASSES[accent]}>
          {viewAllLabel}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} locale={locale} />
        ))}
      </div>
    </section>
  );
}
