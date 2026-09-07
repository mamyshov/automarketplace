import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return <StaticPageContent slug="about" locale="en" />;
}
