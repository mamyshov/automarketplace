import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "Verified cars" };

export default function Page() {
  return <StaticPageContent slug="verification" locale="en" />;
}
