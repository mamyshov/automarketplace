import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "О площадке" };

export default function Page() {
  return <StaticPageContent slug="about" />;
}
