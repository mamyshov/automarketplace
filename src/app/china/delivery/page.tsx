import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "Доставка" };

export default function Page() {
  return <StaticPageContent slug="delivery" />;
}
