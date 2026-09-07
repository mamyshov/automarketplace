import type { Metadata } from "next";
import { CarsPageContent } from "@/app/cars/CarsPageContent";

export const metadata: Metadata = { title: "Cars" };

export default function CarsPageEn({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return <CarsPageContent locale="en" searchParams={searchParams} />;
}
