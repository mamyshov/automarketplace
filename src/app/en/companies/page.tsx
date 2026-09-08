import type { Metadata } from "next";
import { CompaniesContent } from "@/app/companies/CompaniesContent";

export const metadata: Metadata = { title: "Dealers" };
export const revalidate = 60;

export default function CompaniesPageEn() {
  return <CompaniesContent locale="en" />;
}
