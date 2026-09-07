import type { Metadata } from "next";
import { CompaniesContent } from "./CompaniesContent";

export const metadata: Metadata = { title: "Компании" };

export default function CompaniesPage() {
  return <CompaniesContent locale="ru" />;
}
