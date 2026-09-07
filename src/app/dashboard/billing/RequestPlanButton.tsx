"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestPlanUpgrade } from "@/lib/actions/subscriptions";
import type { Plan } from "@/types/database";

export function RequestPlanButton({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) return <span className="text-sm text-success">Заявка отправлена</span>;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await requestPlanUpgrade(plan);
          setDone(true);
          router.refresh();
        })
      }
      className="min-h-touch rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {isPending ? "Отправляем…" : "Запросить тариф"}
    </button>
  );
}
