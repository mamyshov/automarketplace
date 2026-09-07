import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "Как купить авто в Китае" };

export default function Page() {
  return <StaticPageContent slug="how-to-buy" />;
}
