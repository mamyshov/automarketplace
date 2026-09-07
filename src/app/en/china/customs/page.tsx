import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "Customs" };

export default function Page() {
  return <StaticPageContent slug="customs" locale="en" />;
}
