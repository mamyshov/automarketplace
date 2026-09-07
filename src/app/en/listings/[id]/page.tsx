import type { Metadata } from "next";
import { getListingById } from "@/lib/data/listings";
import { ListingDetailContent } from "@/app/listings/[id]/ListingDetailContent";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListingById(params.id);
  if (!listing) return { title: "Listing not found" };
  return {
    title: `${listing.brand} ${listing.model}, ${listing.year}`,
    description: listing.description?.slice(0, 160),
  };
}

export default function ListingDetailPageEn({ params }: { params: { id: string } }) {
  return <ListingDetailContent id={params.id} locale="en" />;
}
