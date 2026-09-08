import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "How to buy a car in China" };
export const revalidate = 60;

export default function Page() {
  return <StaticPageContent slug="how-to-buy" locale="en" />;
}
