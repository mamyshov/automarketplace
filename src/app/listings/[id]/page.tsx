import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getListingById, incrementListingViews } from "@/lib/data/listings";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { LeadForm } from "@/components/ui/LeadForm";
import { formatMileage, formatDate } from "@/lib/format";
import { CheckBadgeIcon, WhatsAppIcon } from "@/components/icons";
import { t } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListingById(params.id);
  if (!listing) return { title: "Объявление не найдено" };
  return {
    title: `${listing.brand} ${listing.model}, ${listing.year}`,
    description: listing.description?.slice(0, 160),
  };
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  // RLS already scopes what `getListingById` can return here (anon session):
  // approved listings for anyone, or the caller's own/admin otherwise. A
  // logged-out visitor hitting an unapproved listing's URL simply gets null.
  const listing = await getListingById(params.id);
  if (!listing) notFound();

  void incrementListingViews(listing.id);

  const photos = [...listing.listing_photos].sort((a, b) => a.position - b.position);
  const specs: [string, string | null][] = [
    ["Рынок", listing.market === "bishkek" ? "В наличии в Бишкеке" : "Из Китая"],
    ["Кузов", listing.body_type],
    ["Коробка", listing.transmission],
    ["Топливо", listing.fuel],
    ["Объём двигателя", listing.engine_volume ? `${listing.engine_volume} л` : null],
    ["Цвет", listing.color],
    ["VIN", listing.vin],
    ["Местонахождение", listing.location],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={listing.status} />
        <FavoriteButton listingId={listing.id} className="bg-neutral-100" />
        {listing.is_verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <CheckBadgeIcon width={14} height={14} /> {t.listing.verified}
          </span>
        )}
        {listing.dealers && (
          <Link
            href={`/companies/${listing.dealers.slug}`}
            className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
          >
            {listing.dealers.verified && "Проверенный поставщик · "}
            {listing.dealers.name}
          </Link>
        )}
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
        {listing.brand} {listing.model}, {listing.year}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {formatMileage(listing.mileage)} · {listing.views_count} {t.listing.views} · опубликовано{" "}
        {formatDate(listing.created_at)}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photos.map((photo, i) => (
                <div key={photo.id} className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100 ${i === 0 ? "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 aspect-[4/3]" : ""}`}>
                  <Image
                    src={photo.url}
                    alt={`${listing.brand} ${listing.model} фото ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                    loading={i < 2 ? "eager" : "lazy"}
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-neutral-100 text-5xl text-neutral-300">
              🚗
            </div>
          )}

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">Характеристики</h2>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {specs
              .filter(([, v]) => !!v)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-neutral-100 py-1.5 text-sm">
                  <dt className="text-neutral-500">{label}</dt>
                  <dd className="font-medium text-neutral-800">{value}</dd>
                </div>
              ))}
          </dl>

          {listing.description && (
            <>
              <h2 className="mt-8 text-lg font-semibold text-neutral-900">Описание</h2>
              <p className="mt-3 whitespace-pre-line text-neutral-700">{listing.description}</p>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            {listing.market === "china" && listing.price_origin && (
              <div className="mb-3 space-y-1 border-b border-neutral-100 pb-3 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>{t.listing.priceOrigin}</span>
                  <span>${new Intl.NumberFormat("en-US").format(listing.price_origin)}</span>
                </div>
                <div className="flex justify-between font-medium text-neutral-800">
                  <span>{t.listing.priceFinal}</span>
                  <span>${new Intl.NumberFormat("en-US").format(listing.price_final)}</span>
                </div>
                <p className="pt-1 text-xs text-neutral-400">{t.listing.estimateNote}</p>
              </div>
            )}
            <div className="mb-4 text-2xl font-bold text-neutral-900">
              ${new Intl.NumberFormat("en-US").format(listing.price_final)}
            </div>

            {listing.dealers?.whatsapp && (
              <a
                href={`https://wa.me/${listing.dealers.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 flex min-h-touch items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 font-semibold text-white hover:opacity-90"
              >
                <WhatsAppIcon width={18} height={18} /> {t.listing.contactSeller}
              </a>
            )}

            <h3 className="mb-2 text-sm font-semibold text-neutral-700">{t.listing.getExactQuote}</h3>
            <LeadForm
              source="listing"
              listingId={listing.id}
              brand={listing.brand}
              model={listing.model}
              year={listing.year}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
