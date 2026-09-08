import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "О площадке" };
export const revalidate = 60;

export default function Page() {
  return <StaticPageContent slug="about" />;
}
