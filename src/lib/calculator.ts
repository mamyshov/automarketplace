import type { CalculatorBreakdown, CalculatorRateRow } from "@/types/database";

export interface CalculatorInput {
  bodyType: string;
  engineVolume: number;
  year: number;
  priceChina: number;
}

/**
 * Finds the matching calculator_rates bracket for the given vehicle and
 * returns the full price breakdown. Rates are always read from the DB
 * (calculator_rates table, admin-editable) — never hardcoded here (spec §5.3).
 */
export function computeEstimate(
  input: CalculatorInput,
  rates: CalculatorRateRow[]
): CalculatorBreakdown | null {
  const match = rates.find(
    (r) =>
      r.is_active &&
      r.body_type === input.bodyType &&
      input.engineVolume >= r.engine_volume_from &&
      input.engineVolume <= r.engine_volume_to &&
      input.year >= r.year_from &&
      input.year <= r.year_to
  );

  if (!match) return null;

  const total = input.priceChina + match.logistics_fee + match.broker_fee + match.customs_duty;

  return {
    priceChina: input.priceChina,
    logisticsFee: match.logistics_fee,
    brokerFee: match.broker_fee,
    customsDuty: match.customs_duty,
    total,
    currency: match.currency,
    rateId: match.id,
    matchedBracket: match.customs_formula,
  };
}

/** Closest-fallback estimate when no bracket matches exactly — picks the
 * bracket for the same body type with the nearest year range, so the
 * calculator still returns *something* rather than a hard "not found". */
export function computeEstimateWithFallback(
  input: CalculatorInput,
  rates: CalculatorRateRow[]
): { breakdown: CalculatorBreakdown | null; approximate: boolean } {
  const exact = computeEstimate(input, rates);
  if (exact) return { breakdown: exact, approximate: false };

  const sameBody = rates.filter((r) => r.is_active && r.body_type === input.bodyType);
  if (sameBody.length === 0) return { breakdown: null, approximate: false };

  const nearest = sameBody.reduce((best, r) => {
    const bestDist = Math.min(
      Math.abs(input.year - best.year_from),
      Math.abs(input.year - best.year_to)
    );
    const rDist = Math.min(Math.abs(input.year - r.year_from), Math.abs(input.year - r.year_to));
    return rDist < bestDist ? r : best;
  }, sameBody[0]);

  const total = input.priceChina + nearest.logistics_fee + nearest.broker_fee + nearest.customs_duty;

  return {
    breakdown: {
      priceChina: input.priceChina,
      logisticsFee: nearest.logistics_fee,
      brokerFee: nearest.broker_fee,
      customsDuty: nearest.customs_duty,
      total,
      currency: nearest.currency,
      rateId: nearest.id,
      matchedBracket: nearest.customs_formula,
    },
    approximate: true,
  };
}
