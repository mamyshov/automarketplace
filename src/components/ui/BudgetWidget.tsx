"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

export function BudgetWidget({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [budget, setBudget] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    trackEvent(ANALYTICS_EVENTS.BUDGET_SEARCH, { budget });
    router.push(`/budget?budget=${encodeURIComponent(budget)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
        <input
          inputMode="numeric"
          required
          value={budget}
          onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
          placeholder={t.home.budgetPlaceholder}
          className="min-h-touch w-full rounded-lg border border-neutral-300 py-2.5 pl-7 pr-3 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <button
        type="submit"
        className="min-h-touch rounded-lg bg-accent-500 px-5 py-2.5 font-semibold text-white transition hover:bg-accent-600"
      >
        {t.home.budgetSubmit}
      </button>
    </form>
  );
}
