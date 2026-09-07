import type { Metadata } from "next";
import { BudgetPageContent } from "@/app/budget/BudgetPageContent";

export const metadata: Metadata = { title: "Match by budget" };

export default function BudgetPageEn({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return <BudgetPageContent locale="en" searchParams={searchParams} />;
}
