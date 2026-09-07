import type { Metadata } from "next";
import { CalculatorForm } from "@/app/china/calculator/CalculatorForm";
import { getDictionary } from "@/lib/i18n";

const dict = getDictionary("en");

export const metadata: Metadata = { title: dict.calculator.title };

export default function CalculatorPageEn({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{dict.calculator.title}</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">{dict.calculator.subtitle}</p>
      <div className="mt-6">
        <CalculatorForm initialBrand={searchParams.brand ?? ""} initialModel={searchParams.model ?? ""} locale="en" />
      </div>
    </div>
  );
}
