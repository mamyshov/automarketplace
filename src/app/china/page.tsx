import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/ui/ListingCard";
import { getFeaturedListings } from "@/lib/data/listings";
import { CalculatorIcon, ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Автомобили из Китая" };

const LINKS = [
  { href: "/china/how-to-buy", title: "Как купить авто в Китае", desc: "Пошаговый процесс покупки" },
  { href: "/china/delivery", title: "Доставка", desc: "Сроки, маршруты, погранпереходы" },
  { href: "/china/verification", title: "Проверка автомобиля", desc: "Что значит «Проверенный автомобиль»" },
  { href: "/china/customs", title: "Таможня", desc: "Пошлины и документы" },
];

export default async function ChinaHubPage() {
  const listings = await getFeaturedListings("china", 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white sm:p-10">
        <h1 className="text-2xl font-bold sm:text-3xl">🇨🇳 Автомобили из Китая под заказ</h1>
        <p className="mt-2 max-w-xl text-brand-50">
          Прозрачный расчёт полной стоимости: цена в Китае + логистика + оформление + таможня.
        </p>
        <Link
          href="/china/calculator"
          className="mt-5 inline-flex min-h-touch items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50"
        >
          <CalculatorIcon width={18} height={18} /> Рассчитать стоимость
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 hover:border-brand-400"
          >
            <div>
              <div className="font-semibold text-neutral-900">{l.title}</div>
              <div className="text-sm text-neutral-500">{l.desc}</div>
            </div>
            <ChevronRightIcon className="shrink-0 text-neutral-400" />
          </Link>
        ))}
      </div>

      {listings.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">Каталог лотов из Китая</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Link href="/cars?market=china" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
            Смотреть все автомобили из Китая →
          </Link>
        </div>
      )}
    </div>
  );
}
