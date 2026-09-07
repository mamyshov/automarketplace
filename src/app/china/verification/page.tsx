import type { Metadata } from "next";
import { StaticPageContent } from "@/components/StaticPageContent";

export const metadata: Metadata = { title: "Проверенный автомобиль" };

export default function Page() {
  return <StaticPageContent slug="verification" />;
}
