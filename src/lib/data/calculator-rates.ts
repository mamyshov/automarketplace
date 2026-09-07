import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CalculatorRateRow } from "@/types/database";

export async function getActiveCalculatorRates(): Promise<CalculatorRateRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("calculator_rates")
    .select("*")
    .eq("is_active", true)
    .order("body_type");

  if (error) {
    console.error("getActiveCalculatorRates failed", error);
    return [];
  }
  return data as CalculatorRateRow[];
}
