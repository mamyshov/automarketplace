import type { Metadata } from "next";
import { BudgetPageContent } from "./BudgetPageContent";

export const metadata: Metadata = { title: "Подбор по бюджету" };

export default function BudgetPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return <BudgetPageContent locale="ru" searchParams={searchParams} />;
}
