import type { Metadata } from "next";
import { CarsPageContent } from "./CarsPageContent";

export const metadata: Metadata = { title: "Автомобили" };

export default function CarsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return <CarsPageContent locale="ru" searchParams={searchParams} />;
}
