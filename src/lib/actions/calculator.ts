"use server";

import { getActiveCalculatorRates } from "@/lib/data/calculator-rates";
import { computeEstimateWithFallback } from "@/lib/calculator";
import type { CalculatorBreakdown } from "@/types/database";

export interface CalculateInput {
  bodyType: string;
  engineVolume: number;
  year: number;
  priceChina: number;
}

export interface CalculateResult {
  ok: boolean;
  breakdown?: CalculatorBreakdown;
  approximate?: boolean;
  error?: string;
}

export async function calculateEstimate(input: CalculateInput): Promise<CalculateResult> {
  if (!input.bodyType || !input.priceChina || input.priceChina <= 0) {
    return { ok: false, error: "Заполните все поля" };
  }

  const rates = await getActiveCalculatorRates();
  const { breakdown, approximate } = computeEstimateWithFallback(
    { bodyType: input.bodyType, engineVolume: input.engineVolume, year: input.year, priceChina: input.priceChina },
    rates
  );

  if (!breakdown) {
    return { ok: false, error: "Не удалось найти тариф для этого типа кузова. Оставьте заявку — менеджер посчитает вручную." };
  }

  return { ok: true, breakdown, approximate };
}
