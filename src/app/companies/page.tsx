import type { Metadata } from "next";
import { CompaniesContent } from "./CompaniesContent";

export const metadata: Metadata = { title: "Компании" };
export const revalidate = 60;

export default function CompaniesPage() {
  return <CompaniesContent locale="ru" />;
}
