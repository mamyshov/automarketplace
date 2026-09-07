"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSubscriptionStatus } from "@/lib/actions/admin";

export function SubscriptionActions({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(status: "active" | "rejected" | "expired") {
    startTransition(async () => {
      await updateSubscriptionStatus(id, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button disabled={isPending} onClick={() => run("active")} className="min-h-touch rounded-lg bg-success px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
        Подтвердить оплату
      </button>
      <button disabled={isPending} onClick={() => run("rejected")} className="min-h-touch rounded-lg bg-danger px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
        Отклонить
      </button>
    </div>
  );
}
