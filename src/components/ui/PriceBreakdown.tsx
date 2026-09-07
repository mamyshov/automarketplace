import { t } from "@/lib/i18n";
import type { CalculatorBreakdown } from "@/types/database";

export function PriceBreakdown({ breakdown, compact = false }: { breakdown: CalculatorBreakdown; compact?: boolean }) {
  const rows: [string, number][] = [
    [t.calculator.priceChinaLabel, breakdown.priceChina],
    [t.calculator.logistics, breakdown.logisticsFee],
    [t.calculator.broker, breakdown.brokerFee],
    [t.calculator.customs, breakdown.customsDuty],
  ];

  return (
    <div className={compact ? "text-sm" : "text-base"}>
      <dl className="divide-y divide-neutral-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-1.5">
            <dt className="text-neutral-500">{label}</dt>
            <dd className="font-medium text-neutral-800">
              ${new Intl.NumberFormat("en-US").format(value)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-2 flex items-center justify-between border-t-2 border-neutral-900 pt-2">
        <span className="font-semibold text-neutral-900">{t.calculator.total}</span>
        <span className="text-xl font-bold text-brand-600">
          ${new Intl.NumberFormat("en-US").format(breakdown.total)}
        </span>
      </div>
      <p className="mt-2 text-xs text-neutral-500">{t.listing.estimateNote}</p>
    </div>
  );
}
