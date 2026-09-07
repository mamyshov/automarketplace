import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDealerBySlug } from "@/lib/data/dealers";
import { getDealerListings } from "@/lib/data/listings";
import { ListingCard } from "@/components/ui/ListingCard";
import { CheckBadgeIcon, WhatsAppIcon } from "@/components/icons";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dealer = await getDealerBySlug(params.slug);
  return { title: dealer?.name ?? "Компания не найдена" };
}

export default async function DealerPage({ params }: { params: { slug: string } }) {
  const dealer = await getDealerBySlug(params.slug);
  if (!dealer) notFound();

  const listings = await getDealerListings(dealer.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 text-3xl">
            {dealer.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dealer.logo_url} alt={dealer.name} className="h-full w-full object-cover" />
            ) : (
              "🚗"
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{dealer.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              {dealer.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">
                  <CheckBadgeIcon width={14} height={14} /> Проверенный поставщик
                </span>
              )}
              {dealer.region && <span className="text-neutral-500">{dealer.region}</span>}
              {dealer.rating > 0 && <span className="text-neutral-500">★ {dealer.rating.toFixed(1)}</span>}
            </div>
          </div>
        </div>

        {dealer.whatsapp && (
          <a
            href={`https://wa.me/${dealer.whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-touch items-center justify-center gap-2 rounded-lg bg-success px-5 py-2.5 font-semibold text-white hover:opacity-90"
          >
            <WhatsAppIcon width={18} height={18} /> Написать в WhatsApp
          </a>
        )}
      </div>

      {dealer.description && (
        <p className="mt-4 max-w-2xl whitespace-pre-line text-neutral-700">{dealer.description}</p>
      )}

      <h2 className="mb-4 mt-8 text-xl font-bold text-neutral-900">Объявления компании ({listings.length})</h2>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          У компании пока нет активных объявлений.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
