import type { Metadata } from "next";
import { ListingForm } from "../ListingForm";

export const metadata: Metadata = { title: "Новое объявление" };

export default function NewListingPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Новое объявление</h1>
      <ListingForm mode="create" />
    </div>
  );
}
