import type { Metadata } from "next";
import { ListingForm } from "../ListingForm";
import { getOwnDealer } from "@/lib/data/dealers";

export const metadata: Metadata = { title: "Новое объявление" };

export default async function NewListingPage() {
  const dealer = await getOwnDealer();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Новое объявление</h1>
      <ListingForm mode="create" ownDealer={dealer ? { id: dealer.id, name: dealer.name } : null} />
    </div>
  );
}
