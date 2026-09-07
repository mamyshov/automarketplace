import type { Metadata } from "next";
import { BudgetWidget } from "@/components/ui/BudgetWidget";
import { ListingCard } from "@/components/ui/ListingCard";
import { LeadForm } from "@/components/ui/LeadForm";
import { getBudgetMatches } from "@/lib/data/listings";

export const metadata: Metadata = { title: "Подбор по бюджету" };

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const budget = Number(searchParams.budget ?? "") || 0;
  const matches = budget > 0 ? await getBudgetMatches(budget) : [];
  const goodMatchCount = matches.filter((m) => Math.abs(m.price_final - budget) / budget <= 0.1).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Подбор автомобиля по бюджету</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Укажите сумму — покажем подходящие варианты из каталога авто из Китая, отсортированные по
        близости к вашему бюджету.
      </p>

      <BudgetWidget className="mt-5 max-w-md" />

      {budget > 0 && (
        <div className="mt-8">
          {matches.length > 0 ? (
            <>
              <p className="mb-3 text-sm text-neutral-500">
                Найдено {matches.length} вариантов рядом с бюджетом ${new Intl.NumberFormat("en-US").format(budget)}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {matches.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-neutral-500">По вашему бюджету пока ничего не нашлось в каталоге.</p>
          )}

          {goodMatchCount === 0 && (
            <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-neutral-900">Не нашли подходящий автомобиль?</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Оставьте заявку — подберём автомобиль под ваш бюджет вручную.
              </p>
              <LeadForm source="budget" budget={budget} className="mt-4 max-w-md" ctaLabel="Подобрать автомобиль" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
