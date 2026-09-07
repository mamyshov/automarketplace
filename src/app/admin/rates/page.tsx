import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RatesManager } from "./RatesManager";
import type { CalculatorRateRow } from "@/types/database";

export const metadata: Metadata = { title: "Ставки калькулятора" };

export default async function RatesPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("calculator_rates").select("*").order("body_type").order("year_from");
  const rates = (data ?? []) as CalculatorRateRow[];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Ставки калькулятора</h1>
      <RatesManager rates={rates} />
    </div>
  );
}
