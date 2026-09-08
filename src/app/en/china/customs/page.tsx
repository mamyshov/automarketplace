import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "Customs" };
export const revalidate = 60;

export default function Page() {
  return <StaticPageContent slug="customs" locale="en" />;
}
