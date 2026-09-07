import type { Metadata } from "next";
import { CalculatorForm } from "./CalculatorForm";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.calculator.title };

export default function CalculatorPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t.calculator.title}</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">{t.calculator.subtitle}</p>
      <div className="mt-6">
        <CalculatorForm initialBrand={searchParams.brand ?? ""} initialModel={searchParams.model ?? ""} locale="ru" />
      </div>
    </div>
  );
}
